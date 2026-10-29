/** The fixture page set as one dense typescript module: the four self contained gallery pages of the 2.0.0 example gallery beside the umd example page, each export holding the exact original file text. The gallery pages are inline styled static documents with their own local fixture origins — no remote resource, no fetch, no storage, no cookie — so every recipe binds to its page the way a live session binds to a real origin; the recipes gate resolves every step selector statically against them, the build ships them through dist/fixtures/pages, and the umd example page carries the dist bundle reference the build rewrites for dist/umd-example.html. */

/** The product-grid fixture page — https://productgrid.test, features product grid, pagination controls, lazy images, price table, review list, image gallery, filter form, typeahead search — exactly the text of the former pages/product-grid.html. */
export const productgrid = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gallery fixture product grid</title>
<meta name="description" content="The product grid fixture page of the devthink example gallery: pagination, lazy images, a price table, a review list, an image gallery, a filter form and a typeahead search.">
<!--
  The product grid fixture page of the example gallery (local origin https://productgrid.test).
  Self contained static html with inline styles and inline script: no remote resource loads,
  no network fetch, no cookie, no storage key. The page exists so the scraping, forms, testing
  and agent recipes have one reviewable local target that mirrors a store listing.
-->
<style>
  :root { color-scheme: light; font-family: system-ui, sans-serif; }
  body { margin: 0 auto; max-width: 860px; padding: 16px; color: #17202e; }
  header h1 { font-size: 22px; margin: 4px 0; }
  header p { color: #56637a; margin: 4px 0 18px; }
  .product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .product-grid article { border: 1px solid #d5dce8; border-radius: 8px; padding: 10px; }
  .product-grid article h3 { font-size: 15px; margin: 0 0 6px; }
  .product-grid article p { margin: 2px 0; color: #56637a; font-size: 13px; }
  .pagination { display: flex; gap: 6px; margin: 16px 0; }
  .pagination button { border: 1px solid #c6cedd; background: #f5f7fb; border-radius: 6px; padding: 6px 12px; cursor: pointer; }
  .pagination button[aria-current="true"] { background: #17202e; color: #fff; border-color: #17202e; }
  table.price-table { border-collapse: collapse; width: 100%; margin: 10px 0 20px; }
  table.price-table th, table.price-table td { border: 1px solid #d5dce8; padding: 6px 10px; text-align: left; font-size: 14px; }
  .review-list blockquote { margin: 8px 0; padding: 8px 12px; border-left: 3px solid #74e8c1; background: #f5f7fb; font-size: 14px; }
  .gallery { display: flex; gap: 10px; flex-wrap: wrap; margin: 12px 0 20px; }
  .gallery img { width: 120px; height: 90px; border-radius: 8px; border: 1px solid #d5dce8; }
  form.filter-form, form.login-free { display: grid; gap: 8px; max-width: 380px; margin: 12px 0 22px; }
  label { font-size: 13px; color: #56637a; }
  input, select { padding: 7px 9px; border: 1px solid #c6cedd; border-radius: 6px; font-size: 14px; }
  button { padding: 8px 14px; border: 1px solid #17202e; background: #17202e; color: #fff; border-radius: 6px; cursor: pointer; }
  .search { max-width: 420px; }
  .search ul { border: 1px solid #c6cedd; border-radius: 6px; margin: 4px 0 20px; padding: 0; list-style: none; }
  .search ul li { padding: 6px 10px; font-size: 14px; }
  footer p { color: #56637a; font-size: 12px; }
</style>
</head>
<body>
<header>
  <h1>Fixture store product grid</h1>
  <p>The local gallery fixture of the devthink example recipes: pagination, lazy images, a price table, reviews, an image gallery, filters and typeahead search.</p>
</header>
<div class="search">
  <label for="typeahead">Search products</label>
  <input id="typeahead" name="typeahead" type="search" placeholder="lumen desk lamp" autocomplete="off" aria-describedby="typeaheadhint">
  <p id="typeaheadhint" hidden>Suggestions appear as you type.</p>
  <ul id="suggestions" hidden></ul>
</div>
<form class="filter-form" aria-label="Product filters">
  <label for="category">Category</label>
  <input id="category" name="category" value="lamps">
  <label for="maxprice">Maximum price</label>
  <input id="maxprice" name="maxprice" type="number" min="1" value="120">
  <button type="button" id="applyfilters">Apply filters</button>
</form>
<main>
  <section aria-label="Product grid">
    <div class="product-grid" id="grid">
      <article><h3>Lumen desk lamp</h3><p>$89.00 — warm dimmable light</p><a href="#grid">Details</a></article>
      <article><h3>Harbor shelf</h3><p>$45.00 — oak finish</p><a href="#grid">Details</a></article>
      <article><h3>North chair</h3><p>$120.00 — felt seat</p><a href="#grid">Details</a></article>
      <article><h3>Cove blanket</h3><p>$32.00 — wool weave</p><a href="#grid">Details</a></article>
      <article><h3>Fjord kettle</h3><p>$58.00 — steel body</p><a href="#grid">Details</a></article>
      <article><h3>Atlas clock</h3><p>$27.00 — silent sweep</p><a href="#grid">Details</a></article>
    </div>
    <nav class="pagination" aria-label="Grid pagination">
      <button type="button" data-page="1" aria-current="true">Page 1</button>
      <button type="button" data-page="2">Page 2</button>
      <button type="button" data-page="3">Page 3</button>
    </nav>
  </section>
  <section aria-label="Price table">
    <table class="price-table">
      <caption>Current fixture prices</caption>
      <thead><tr><th scope="col">Product</th><th scope="col">Price</th><th scope="col">Stock</th></tr></thead>
      <tbody>
        <tr><td>Lumen desk lamp</td><td>$89.00</td><td>12</td></tr>
        <tr><td>Harbor shelf</td><td>$45.00</td><td>8</td></tr>
        <tr><td>North chair</td><td>$120.00</td><td>3</td></tr>
        <tr><td>Cove blanket</td><td>$32.00</td><td>20</td></tr>
        <tr><td>Fjord kettle</td><td>$58.00</td><td>0</td></tr>
        <tr><td>Atlas clock</td><td>$27.00</td><td>15</td></tr>
      </tbody>
    </table>
  </section>
  <section aria-label="Product image gallery">
    <h2>Image gallery</h2>
    <div class="gallery">
      <img src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='90'%3E%3Crect width='120' height='90' fill='%2374e8c1'/%3E%3C/svg%3E" data-name="lumen-desk-lamp" alt="Lumen desk lamp product image" loading="lazy">
      <img src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='90'%3E%3Crect width='120' height='90' fill='%23ffd166'/%3E%3C/svg%3E" data-name="harbor-shelf" alt="Harbor shelf product image" loading="lazy">
      <img src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='90'%3E%3Crect width='120' height='90' fill='%23ff7b8e'/%3E%3C/svg%3E" data-name="north-chair" alt="North chair product image" loading="lazy">
      <img src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='90'%3E%3Crect width='120' height='90' fill='%239ae6b4'/%3E%3C/svg%3E" data-name="cove-blanket" alt="Cove blanket product image" loading="lazy">
    </div>
  </section>
  <section aria-label="Product reviews">
    <h2>Reviews</h2>
    <div class="review-list">
      <blockquote>The lamp dims smoothly and the finish feels solid.</blockquote>
      <blockquote>Shipping was quick and the shelf holds its weight.</blockquote>
      <blockquote>The clock runs silently, exactly as described.</blockquote>
    </div>
  </section>
</main>
<footer>
  <p>Fixture page of the devthink example gallery — local origin https://productgrid.test, no remote resource, no storage, no cookie.</p>
</footer>
<script>
/* The inline behavior of the fixture page: pagination swaps a data attribute, the filter
   button reports the applied filters, and the typeahead input renders the suggestions list.
   Everything stays local and deterministic; nothing leaves the page. */
(function () {
  "use strict";
  var grid = document.getElementById("grid");
  var pager = document.querySelectorAll(".pagination button");
  var filters = document.getElementById("applyfilters");
  var typeahead = document.getElementById("typeahead");
  var hint = document.getElementById("typeaheadhint");
  var suggestions = document.getElementById("suggestions");
  var products = ["lumen desk lamp", "harbor shelf", "north chair", "cove blanket", "fjord kettle", "atlas clock"];
  for (var index = 0; index < pager.length; index += 1) {
    pager[index].addEventListener("click", function (event) {
      for (var other = 0; other < pager.length; other += 1) pager[other].removeAttribute("aria-current");
      event.target.setAttribute("aria-current", "true");
      if (grid) grid.setAttribute("data-page", event.target.getAttribute("data-page"));
    });
  }
  if (filters) filters.addEventListener("click", function () {
    if (grid) grid.setAttribute("data-filtered", "true");
  });
  if (typeahead) typeahead.addEventListener("input", function () {
    var query = typeahead.value.trim().toLowerCase();
    if (hint) hint.hidden = query === "";
    if (suggestions) {
      suggestions.replaceChildren();
      var matches = products.filter(function (product) { return product.indexOf(query) >= 0; }).slice(0, 3);
      for (var match = 0; match < matches.length; match += 1) {
        var item = document.createElement("li");
        item.textContent = matches[match];
        suggestions.append(item);
      }
      suggestions.hidden = matches.length === 0;
    }
  });
})();
</script>
</body>
</html>
`;

/** The checkout fixture page — https://checkout.test, features login form, checkout wizard, registration form, dependent dropdowns, delivery calendar, validation errors — exactly the text of the former pages/checkout.html. */
export const checkout = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gallery fixture checkout</title>
<meta name="description" content="The checkout fixture page of the devthink example gallery: a login form, a checkout wizard, a registration form, dependent dropdowns, a delivery calendar and inline validation errors.">
<!--
  The checkout fixture page of the example gallery (local origin https://checkout.test).
  Self contained static html with inline styles and inline script: no remote resource loads,
  no payment call, no storage. The page exists so the form recipes have one reviewable local
  target that mirrors a checkout flow with its validation behavior.
-->
<style>
  :root { color-scheme: light; font-family: system-ui, sans-serif; }
  body { margin: 0 auto; max-width: 640px; padding: 16px; color: #17202e; }
  header h1 { font-size: 22px; margin: 4px 0; }
  header p { color: #56637a; margin: 4px 0 18px; }
  form { display: grid; gap: 8px; border: 1px solid #d5dce8; border-radius: 10px; padding: 14px; margin: 14px 0 22px; }
  form h2 { font-size: 16px; margin: 0 0 6px; }
  label { font-size: 13px; color: #56637a; }
  input, select { padding: 7px 9px; border: 1px solid #c6cedd; border-radius: 6px; font-size: 14px; }
  button { padding: 8px 14px; border: 1px solid #17202e; background: #17202e; color: #fff; border-radius: 6px; cursor: pointer; justify-self: start; }
  ol.steps { display: flex; gap: 8px; list-style: none; padding: 0; margin: 0 0 10px; font-size: 13px; }
  ol.steps li { padding: 4px 10px; border: 1px solid #c6cedd; border-radius: 999px; color: #56637a; }
  ol.steps li[aria-current="true"] { background: #17202e; color: #fff; border-color: #17202e; }
  fieldset { border: 1px solid #d5dce8; border-radius: 8px; margin: 6px 0; }
  .form-error { display: none; margin: 8px 0 0; padding: 8px 12px; border-left: 3px solid #ff7b8e; background: #fff2f4; color: #8a2233; font-size: 13px; }
  .form-error[data-visible="true"] { display: block; }
  footer p { color: #56637a; font-size: 12px; }
</style>
</head>
<body>
<header>
  <h1>Fixture checkout</h1>
  <p>The local gallery fixture of the devthink form recipes: a login form, a checkout wizard, a registration form, dependent dropdowns and a delivery calendar.</p>
</header>
<main>
  <form class="login-form" aria-label="Account login">
    <h2>Account login</h2>
    <label for="loginemail">Email</label>
    <input id="loginemail" name="email" type="email" autocomplete="username">
    <label for="loginpassword">Password</label>
    <input id="loginpassword" name="password" type="password" autocomplete="current-password">
    <button type="button" id="loginsubmit">Log in</button>
    <p class="form-error" id="loginerror" role="alert">The email field needs a valid address before the login continues.</p>
  </form>
  <form class="checkout-form" aria-label="Checkout wizard">
    <h2>Checkout</h2>
    <ol class="steps" id="checkoutsteps">
      <li aria-current="true">Address</li>
      <li>Shipping</li>
      <li>Review</li>
    </ol>
    <fieldset>
      <legend>Address</legend>
      <label for="checkoutname">Full name</label>
      <input id="checkoutname" name="name">
      <label for="checkoutaddress">Street address</label>
      <input id="checkoutaddress" name="address">
      <label for="checkoutcity">City</label>
      <input id="checkoutcity" name="city">
    </fieldset>
    <fieldset id="shippingfields" hidden>
      <legend>Shipping</legend>
      <label for="shipping">Shipping method</label>
      <select id="shipping" name="shipping"><option value="standard">Standard</option><option value="express">Express</option></select>
    </fieldset>
    <fieldset id="reviewfields" hidden>
      <legend>Review</legend>
      <label for="cardnumber">Card number</label>
      <input id="cardnumber" name="cardnumber" inputmode="numeric" placeholder="0000 0000 0000 0000">
    </fieldset>
    <button type="button" id="checkoutsubmit">Place the order</button>
    <p class="form-error" id="checkouterror" role="alert">The card number field stays empty; the review step refuses the order.</p>
  </form>
  <form class="registration-form" aria-label="Account registration">
    <h2>Registration</h2>
    <label for="fullname">Full name</label>
    <input id="fullname" name="fullname">
    <label for="regemail">Email</label>
    <input id="regemail" name="email" type="email">
    <label for="phone">Phone</label>
    <input id="phone" name="phone" type="tel">
    <button type="button" id="registersubmit">Create the account</button>
    <p class="form-error" id="registererror" role="alert">The registration needs a name before the account is created.</p>
  </form>
  <form class="wizard-form" aria-label="Delivery wizard">
    <h2>Delivery wizard</h2>
    <ol class="steps" id="wizardsteps">
      <li aria-current="true">Address</li>
      <li>Delivery</li>
      <li>Confirm</li>
    </ol>
    <label for="wizardname">Name</label>
    <input id="wizardname" name="name">
    <label for="wizardstreet">Street</label>
    <input id="wizardstreet" name="street">
    <label for="wizardcity">City</label>
    <input id="wizardcity" name="city">
    <button type="button" id="wizardsubmit">Confirm the delivery</button>
    <p class="form-error" id="wizarderror" role="alert">The delivery wizard needs every address field before it confirms.</p>
  </form>
  <form class="dropdown-form" aria-label="Region and city">
    <h2>Region and city</h2>
    <label for="region">Region</label>
    <select id="region" name="region">
      <option value="">Choose a region</option>
      <option value="north">North</option>
      <option value="south">South</option>
    </select>
    <label for="city">City</label>
    <select id="city" name="city" disabled>
      <option value="">Choose a city</option>
    </select>
    <button type="button" id="dropdownsubmit">Save the region</button>
  </form>
  <form class="calendar-form" aria-label="Delivery date">
    <h2>Delivery date</h2>
    <label for="delivery">Delivery date</label>
    <input id="delivery" name="delivery" type="date">
    <button type="button" id="calendarsubmit">Choose the date</button>
  </form>
</main>
<footer>
  <p>Fixture page of the devthink example gallery — local origin https://checkout.test, no remote resource, no payment call, no storage.</p>
</footer>
<script>
/* The inline behavior of the fixture page: the dependent dropdown fills its city options from
   the chosen region, the wizard and checkout step lists advance their step markers, and every
   submit button reveals the inline validation error the validation recipes read. */
(function () {
  "use strict";
  var cities = { north: ["harbor", "fjord"], south: ["cove", "atlas"] };
  var region = document.getElementById("region");
  var city = document.getElementById("city");
  function showerror(id) {
    var node = document.getElementById(id);
    if (node) node.setAttribute("data-visible", "true");
  }
  var errors = [
    ["loginsubmit", "loginerror"],
    ["checkoutsubmit", "checkouterror"],
    ["registersubmit", "registererror"],
    ["wizardsubmit", "wizarderror"],
    ["dropdownsubmit", null],
    ["calendarsubmit", null]
  ];
  for (var index = 0; index < errors.length; index += 1) {
    var button = document.getElementById(errors[index][0]);
    var errorid = errors[index][1];
    if (button) button.addEventListener("click", function (errorvalue) {
      return function () { if (errorvalue !== null) showerror(errorvalue); };
    }(errorid));
  }
  if (region && city) region.addEventListener("change", function () {
    var chosen = region.value;
    while (city.options.length > 1) city.remove(1);
    var list = cities[chosen] || [];
    for (var option = 0; option < list.length; option += 1) {
      var item = document.createElement("option");
      item.value = list[option];
      item.textContent = list[option];
      city.append(item);
    }
    city.disabled = chosen === "";
  });
  function advance(listid) {
    var list = document.getElementById(listid);
    if (!list) return;
    var steps = list.children;
    for (var step = 0; step < steps.length; step += 1) {
      if (steps[step].getAttribute("aria-current") === "true") {
        steps[step].removeAttribute("aria-current");
        if (steps[step + 1]) steps[step + 1].setAttribute("aria-current", "true");
        return;
      }
    }
  }
  var shippingfields = document.getElementById("shippingfields");
  var reviewfields = document.getElementById("reviewfields");
  var checkoutsubmit = document.getElementById("checkoutsubmit");
  if (checkoutsubmit) checkoutsubmit.addEventListener("click", function () {
    if (shippingfields && shippingfields.hidden) { shippingfields.hidden = false; advance("checkoutsteps"); return; }
    if (reviewfields && reviewfields.hidden) { reviewfields.hidden = false; advance("checkoutsteps"); }
  });
  var wizardsubmit = document.getElementById("wizardsubmit");
  if (wizardsubmit) wizardsubmit.addEventListener("click", function () { advance("wizardsteps"); });
})();
</script>
</body>
</html>
`;

/** The dashboard fixture page — https://dashboard.test, features price ticker, timers, toasts, console noise, availability badge, deep links, network quiet — exactly the text of the former pages/dashboard.html. */
export const dashboard = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gallery fixture dashboard</title>
<meta name="description" content="The dashboard fixture page of the devthink example gallery: a price ticker on a timer, toasts, console noise, an availability badge, deep links and network quiet.">
<!--
  The dashboard fixture page of the example gallery (local origin https://dashboard.test).
  Self contained static html with inline styles and inline script: the timers tick locally,
  the console noise writes to the devtools console only, the network quiet is a local activity
  counter that decays over time — no remote resource, no fetch, no storage, no cookie.
-->
<style>
  :root { color-scheme: dark; font-family: system-ui, sans-serif; }
  body { margin: 0 auto; max-width: 720px; padding: 16px; background: #090d16; color: #eff6ff; }
  header h1 { font-size: 22px; margin: 4px 0; }
  header p { color: #9aa8bd; margin: 4px 0 18px; }
  .price-ticker { display: flex; gap: 14px; flex-wrap: wrap; border: 1px solid #26334b; border-radius: 10px; padding: 12px; margin: 12px 0 18px; font-variant-numeric: tabular-nums; }
  .price-ticker span { font-size: 15px; }
  .price-ticker span[data-direction="up"] { color: #9ae6b4; }
  .price-ticker span[data-direction="down"] { color: #ff7b8e; }
  .availability { display: inline-block; border-radius: 999px; border: 1px solid #56cc9b; color: #56cc9b; font-size: 12px; font-weight: 700; letter-spacing: .06em; padding: 3px 10px; text-transform: uppercase; }
  .toasts { display: grid; gap: 8px; margin: 12px 0 18px; }
  .toast { border: 1px solid #26334b; border-radius: 8px; background: #11192a; padding: 8px 12px; font-size: 13px; color: #9aa8bd; }
  nav.deeplinks { display: flex; gap: 10px; flex-wrap: wrap; margin: 12px 0 22px; }
  nav.deeplinks a { color: #74e8c1; font-size: 14px; }
  .meter { border: 1px solid #26334b; border-radius: 8px; padding: 10px; font-size: 13px; color: #9aa8bd; margin: 12px 0 22px; }
  footer p { color: #9aa8bd; font-size: 12px; }
</style>
</head>
<body>
<header>
  <h1>Fixture dashboard</h1>
  <p>The local gallery fixture of the devthink monitoring and testing recipes: a live price ticker, timers, toasts, console noise, an availability badge, deep links and network quiet.</p>
</header>
<main>
  <section aria-label="Price ticker">
    <h2>Price ticker</h2>
    <p><span class="availability" id="availabilitybadge">All systems available</span></p>
    <div class="price-ticker" id="ticker" aria-live="off">
      <span data-symbol="LUMEN" data-direction="up">$89.00</span>
      <span data-symbol="HARBOR" data-direction="down">$45.00</span>
      <span data-symbol="NORTH" data-direction="up">$120.00</span>
    </div>
  </section>
  <section aria-label="Activity">
    <h2>Activity</h2>
    <div class="toasts" id="toasts">
      <div class="toast" role="status">The nightly digest finished at 03:00.</div>
      <div class="toast" role="status">The inventory sync queued 6 rows.</div>
    </div>
    <div class="meter" id="networkmeter" role="status" aria-live="polite">Network activity: 3 pending events.</div>
  </section>
  <nav class="deeplinks" aria-label="Dashboard deep links">
    <a href="#ticker">Open the ticker</a>
    <a href="#toasts">Open the toasts</a>
    <a href="#networkmeter">Open the network meter</a>
  </nav>
</main>
<footer>
  <p>Fixture page of the devthink example gallery — local origin https://dashboard.test, no remote resource, no fetch, no storage, no cookie.</p>
</footer>
<script>
/* The inline behavior of the fixture page: the ticker timer nudges one price per tick, the
   toast timer appends one line per tick, the console noise writes one log line and one error
   line on load, and the network meter decays its local activity counter toward quiet. */
(function () {
  "use strict";
  var ticker = document.getElementById("ticker");
  var toasts = document.getElementById("toasts");
  var meter = document.getElementById("networkmeter");
  var symbols = ticker ? ticker.querySelectorAll("span") : [];
  var prices = [];
  for (var index = 0; index < symbols.length; index += 1) {
    prices.push(Number.parseFloat(symbols[index].textContent.replace("$", "")) || 0);
  }
  var tick = 0;
  var timer = window.setInterval(function () {
    tick += 1;
    if (symbols.length > 0) {
      var slot = tick % symbols.length;
      var next = prices[slot] + (tick % 2 === 0 ? 0.5 : -0.5);
      prices[slot] = next;
      symbols[slot].setAttribute("data-direction", next >= 0 ? "up" : "down");
      symbols[slot].textContent = "$" + next.toFixed(2);
    }
    if (toasts) {
      var toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.textContent = "Tick " + tick + ": the local fixture timer fired.";
      toasts.append(toast);
      if (toasts.children.length > 6) toasts.firstElementChild.remove();
    }
  }, 1200);
  if (meter) {
    var pending = 3;
    var quiet = window.setInterval(function () {
      pending = Math.max(0, pending - 1);
      meter.textContent = "Network activity: " + pending + " pending event" + (pending === 1 ? "" : "s") + (pending === 0 ? " — quiet." : ".");
    }, 900);
    window.addEventListener("beforeunload", function () { window.clearInterval(timer); window.clearInterval(quiet); });
  }
  console.log("The fixture dashboard booted with 3 pending network events.");
  console.error("The fixture dashboard records one deliberate console error for the console recipes.");
})();
</script>
</body>
</html>
`;

/** The feed fixture page — https://feed.test, features infinite scroll, delayed loads, search results, nested comment tree — exactly the text of the former pages/feed.html. */
export const feed = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gallery fixture feed</title>
<meta name="description" content="The feed fixture page of the devthink example gallery: an infinite scroll feed with a sentinel, delayed card loads, search results and a nested comment tree.">
<!--
  The feed fixture page of the example gallery (local origin https://feed.test).
  Self contained static html with inline styles and inline script: the infinite scroll appends
  local cards at the sentinel, the delayed loads reveal their cards on timers, and the search
  results and the comment tree are static markup — no remote resource, no fetch, no storage.
-->
<style>
  :root { color-scheme: light; font-family: system-ui, sans-serif; }
  body { margin: 0 auto; max-width: 640px; padding: 16px; color: #17202e; }
  header h1 { font-size: 22px; margin: 4px 0; }
  header p { color: #56637a; margin: 4px 0 18px; }
  .feed { display: grid; gap: 10px; margin: 12px 0 18px; }
  .feed article { border: 1px solid #d5dce8; border-radius: 10px; padding: 12px; }
  .feed article h3 { font-size: 15px; margin: 0 0 4px; }
  .feed article p { margin: 2px 0; color: #56637a; font-size: 13px; }
  .feed article[hidden] { display: none; }
  .sentinel { height: 2px; background: #c6cedd; border-radius: 999px; margin: 18px 0 26px; }
  .searchresults { border: 1px solid #d5dce8; border-radius: 10px; padding: 12px; margin: 12px 0 22px; }
  .searchresults h2 { font-size: 16px; margin: 0 0 8px; }
  .searchresults a { color: #0c6b5a; font-size: 14px; display: block; margin: 4px 0; }
  .searchresults p { color: #56637a; font-size: 13px; margin: 2px 0; }
  .comment-tree { margin: 10px 0 22px; padding-left: 0; list-style: none; font-size: 14px; }
  .comment-tree ul { list-style: none; padding-left: 18px; }
  .comment-tree li { border-left: 2px solid #d5dce8; padding: 4px 0 4px 10px; margin: 4px 0; }
  footer p { color: #56637a; font-size: 12px; }
</style>
</head>
<body>
<header>
  <h1>Fixture feed</h1>
  <p>The local gallery fixture of the devthink scraping and monitoring recipes: an infinite feed, delayed loads, search results and a nested comment tree.</p>
</header>
<main>
  <section aria-label="Infinite feed">
    <h2>Feed</h2>
    <div class="feed" id="feed">
      <article><h3>Feed card 1</h3><p>The first fixture feed card loads with the page.</p></article>
      <article><h3>Feed card 2</h3><p>The second fixture feed card loads with the page.</p></article>
      <article data-delayed="true" hidden><h3>Feed card 3</h3><p>The third fixture feed card loads on its delay timer.</p></article>
      <article data-delayed="true" hidden><h3>Feed card 4</h3><p>The fourth fixture feed card loads on its delay timer.</p></article>
    </div>
    <div class="sentinel" id="sentinel" aria-hidden="true"></div>
  </section>
  <section class="searchresults" aria-label="Search results">
    <h2>Search results</h2>
    <a href="#feed">Lumen desk lamp — fixture result</a>
    <p>The result excerpts stay local: no query leaves the page.</p>
    <a href="#commenttree">Harbor shelf — fixture result</a>
    <p>Every result anchor resolves inside the same fixture document.</p>
  </section>
  <section aria-label="Comments">
    <h2 id="commenttree">Comments</h2>
    <ul class="comment-tree">
      <li>Top comment one
        <ul>
          <li>Reply one
            <ul><li>Deep reply</li></ul>
          </li>
          <li>Reply two</li>
        </ul>
      </li>
      <li>Top comment two
        <ul><li>Reply three</li></ul>
      </li>
    </ul>
  </section>
</main>
<footer>
  <p>Fixture page of the devthink example gallery — local origin https://feed.test, no remote resource, no fetch, no storage, no cookie.</p>
</footer>
<script>
/* The inline behavior of the fixture page: the delay timers reveal the delayed cards, and the
   intersection of the sentinel with the viewport appends one new feed card per arrival, capped
   at the reviewed card count so the page never grows unbounded. */
(function () {
  "use strict";
  var feed = document.getElementById("feed");
  var sentinel = document.getElementById("sentinel");
  var delayed = document.querySelectorAll("[data-delayed='true']");
  for (var index = 0; index < delayed.length; index += 1) {
    (function (card, delay) {
      window.setTimeout(function () { card.hidden = false; }, delay);
    }(delayed[index], 600 + index * 500));
  }
  var appended = 0;
  var cap = 6;
  if (sentinel && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      for (var entry = 0; entry < entries.length; entry += 1) {
        if (!entries[entry].isIntersecting || appended >= cap) continue;
        appended += 1;
        var card = document.createElement("article");
        var heading = document.createElement("h3");
        heading.textContent = "Appended feed card " + appended;
        var line = document.createElement("p");
        line.textContent = "The infinite scroll fixture appended this card locally.";
        card.append(heading, line);
        feed.append(card);
      }
    }, { rootMargin: "64px" });
    observer.observe(sentinel);
  }
})();
</script>
</body>
</html>
`;

/** The umd example page — the script tag document that reads the lowercase devthink global the umd envelope exposes, carrying the ../../dist/devthink.umd.js reference the build rewrites to the dist root. The exact text of the former umd.html. */
export const umdexample = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Devthink umd example</title>
</head>
<body>
  <h1>Devthink umd script tag example</h1>
  <p>This page loads the umd bundle from a file url and prints the bundle stamp of the running library; the consent gates stay intact inside the browser bundle.</p>
  <pre id="out">loading…</pre>
  <script src="../../dist/devthink.umd.js"></script>
  <script>
    const out = document.getElementById("out");
    out.textContent = JSON.stringify(window.devthink.bundlestamp(), null, 2) + "\\n" + Object.keys(window.devthink).length + " exports on window.devthink";
  </script>
</body>
</html>
`;

/** The four gallery fixture pages keyed by their original file name, so the gates, the tests and the build iterate them without touching the file system; each key names the dist copy the fixtureset ships. */
export const fixturepages = {
  "product-grid.html": productgrid,
  "checkout.html": checkout,
  "dashboard.html": dashboard,
  "feed.html": feed,
} as const;
