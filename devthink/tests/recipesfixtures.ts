/** The example gallery of the 2.0.0 release as one dense typescript module: the 36 recipe plan documents beside the gallery index the metadata carries, each export holding the exact original file text of the tests/code/recipes source set the thirteenth wave folded here. The recipes gate loads every plan through the cli loader, the lint engine and the dry run pipeline; the build materializes the same texts into dist/fixtures/recipes and dist/gallery.json so every package channel ships them; the cli recipes command reads the index through its repository fallback. The recipe ids stay the file stems they always were, so the gallery index, the docs tables and the artifact rows keep naming every entry exactly as before. */

/** The scraping recipe scrapeproductgrid — starter, 4 steps over https://productgrid.test against the product-grid.html page, 1600 ms expected, kinds observe, countelements, readtext, exportjson: Count and read the product cards of the fixture store, then export the grid inventory as json. */
export const scrapeproductgrid = `{
  "version": "2.0.0",
  "goal": "Scrape the product grid of the gallery fixture store",
  "origin": "https://productgrid.test",
  "grants": ["observe", "countelements", "readtext", "exportjson"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the product grid page" },
    { "id": "cards", "kind": "countelements", "label": "Count the product cards", "target": ".product-grid article" },
    { "id": "titles", "kind": "readtext", "label": "Read the product titles", "target": ".product-grid article h3" },
    { "id": "export", "kind": "exportjson", "label": "Export the grid inventory", "gate": true, "options": "{\\"name\\":\\"product-grid-inventory\\"}" }
  ]
}
`;

/** The scraping recipe scrapetablepagination — starter, 4 steps over https://productgrid.test against the product-grid.html page, 1800 ms expected, kinds observe, scrapetable, countpages, exportcsv: Scrape the paginated price table and export its rows as csv beside the page count. */
export const scrapetablepagination = `{
  "version": "2.0.0",
  "goal": "Scrape the paginated price table of the gallery fixture store",
  "origin": "https://productgrid.test",
  "grants": ["observe", "scrapetable", "countpages", "exportcsv"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the paginated results table" },
    { "id": "table", "kind": "scrapetable", "label": "Scrape the price table", "target": "table.price-table" },
    { "id": "pages", "kind": "countpages", "label": "Count the pagination pages" },
    { "id": "export", "kind": "exportcsv", "label": "Export the table rows", "gate": true, "options": "{\\"name\\":\\"price-table-rows\\"}" }
  ]
}
`;

/** The scraping recipe scrapereviews — intermediate, 4 steps over https://productgrid.test against the product-grid.html page, 3200 ms expected, kinds observe, countelements, readtext, exportjson: Count and read the fixture reviews, then export the review digest as json. */
export const scrapereviews = `{
  "version": "2.0.0",
  "goal": "Scrape the product reviews of the gallery fixture store",
  "origin": "https://productgrid.test",
  "grants": ["observe", "countelements", "readtext", "exportjson"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the review list" },
    { "id": "reviews", "kind": "countelements", "label": "Count the reviews", "target": ".review-list blockquote" },
    { "id": "text", "kind": "readtext", "label": "Read the review text", "target": ".review-list" },
    { "id": "export", "kind": "exportjson", "label": "Export the review digest", "gate": true, "options": "{\\"name\\":\\"review-digest\\"}" }
  ]
}
`;

/** The scraping recipe scrapesearchresults — starter, 4 steps over https://feed.test against the feed.html page, 1700 ms expected, kinds observe, readlinks, readmeta, exportjson: Read the fixture search result links and metadata, then export the result set as json. */
export const scrapesearchresults = `{
  "version": "2.0.0",
  "goal": "Scrape the search results of the gallery fixture feed",
  "origin": "https://feed.test",
  "grants": ["observe", "readlinks", "readmeta", "exportjson"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the search results page" },
    { "id": "results", "kind": "readlinks", "label": "Read the result links" },
    { "id": "meta", "kind": "readmeta", "label": "Read the result metadata" },
    { "id": "export", "kind": "exportjson", "label": "Export the result set", "gate": true, "options": "{\\"name\\":\\"search-results\\"}" }
  ]
}
`;

/** The scraping recipe scrapenestedlists — intermediate, 4 steps over https://feed.test against the feed.html page, 3400 ms expected, kinds observe, detectlists, readhtml, exportexcel: Detect and read the nested comment tree, then export the tree outline as an excel sheet. */
export const scrapenestedlists = `{
  "version": "2.0.0",
  "goal": "Scrape the nested comment lists of the gallery fixture feed",
  "origin": "https://feed.test",
  "grants": ["observe", "detectlists", "readhtml", "exportexcel"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the nested comment tree" },
    { "id": "lists", "kind": "detectlists", "label": "Detect the nested list structure" },
    { "id": "tree", "kind": "readhtml", "label": "Read the comment tree markup", "target": ".comment-tree" },
    { "id": "export", "kind": "exportexcel", "label": "Export the tree outline", "gate": true, "options": "{\\"name\\":\\"comment-tree-outline\\"}" }
  ]
}
`;

/** The scraping recipe scrapeinfinitefeed — advanced, 5 steps over https://feed.test against the feed.html page, 6500 ms expected, kinds observe, detectinfinitescroll, readscrollpos, readtext, exportjson: Detect the infinite scroll sentinel, read the feed cards and export the feed capture as json. */
export const scrapeinfinitefeed = `{
  "version": "2.0.0",
  "goal": "Scrape the infinite feed of the gallery fixture feed",
  "origin": "https://feed.test",
  "grants": ["observe", "detectinfinitescroll", "readscrollpos", "readtext", "exportjson"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the infinite feed" },
    { "id": "infinite", "kind": "detectinfinitescroll", "label": "Detect the infinite scroll sentinel" },
    { "id": "position", "kind": "readscrollpos", "label": "Read the feed scroll position" },
    { "id": "cards", "kind": "readtext", "label": "Read the feed cards", "target": ".feed article" },
    { "id": "export", "kind": "exportjson", "label": "Export the feed capture", "gate": true, "options": "{\\"name\\":\\"feed-capture\\"}" }
  ]
}
`;

/** The scraping recipe scrapedynamicprices — intermediate, 5 steps over https://dashboard.test against the dashboard.html page, 3800 ms expected, kinds observe, waitelement, readtext, watchmutate, exportcsv: Wait for the live price ticker, read the prices, watch the mutations and export the series as csv. */
export const scrapedynamicprices = `{
  "version": "2.0.0",
  "goal": "Scrape the dynamic prices of the gallery fixture dashboard",
  "origin": "https://dashboard.test",
  "grants": ["observe", "waitelement", "readtext", "watchmutate", "exportcsv"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the live price ticker" },
    { "id": "settle", "kind": "waitelement", "label": "Wait for the ticker element", "target": ".price-ticker", "options": "{\\"wait\\":2000}" },
    { "id": "ticker", "kind": "readtext", "label": "Read the current prices", "target": ".price-ticker" },
    { "id": "changes", "kind": "watchmutate", "label": "Watch the price mutations" },
    { "id": "export", "kind": "exportcsv", "label": "Export the price series", "gate": true, "options": "{\\"name\\":\\"price-series\\"}" }
  ]
}
`;

/** The scraping recipe scrapeimagegallery — intermediate, 4 steps over https://productgrid.test against the product-grid.html page, 3000 ms expected, kinds observe, readimages, verifyvisible, exportcsv: Read the fixture image gallery inventory, verify the images render and export the asset manifest as csv. */
export const scrapeimagegallery = `{
  "version": "2.0.0",
  "goal": "Scrape the image gallery inventory of the gallery fixture store",
  "origin": "https://productgrid.test",
  "grants": ["observe", "readimages", "verifyvisible", "exportcsv"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the product image gallery" },
    { "id": "images", "kind": "readimages", "label": "Read the gallery image inventory" },
    { "id": "visible", "kind": "verifyvisible", "label": "Verify the gallery images render", "target": ".gallery img" },
    { "id": "export", "kind": "exportcsv", "label": "Export the asset manifest", "gate": true, "options": "{\\"name\\":\\"gallery-assets\\"}" }
  ]
}
`;

/** The forms recipe fillloginform — intermediate, 4 steps over https://checkout.test against the checkout.html page, 3600 ms expected, kinds observe, readforms, fillform, submit, consent classes credential: The consented login form recipe: the credential class consent the review demands before the login fill runs. */
export const fillloginform = `{
  "version": "2.0.0",
  "goal": "Fill the consented login form of the gallery fixture checkout",
  "origin": "https://checkout.test",
  "grants": ["observe", "readforms", "fillform", "submit"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the login form" },
    { "id": "fields", "kind": "readforms", "label": "Read the login form controls" },
    { "id": "fill", "kind": "fillform", "label": "Fill the login credentials", "gate": true, "target": "form.login-form", "options": "{\\"fields\\":[{\\"name\\":\\"email\\"},{\\"name\\":\\"password\\"}]}" },
    { "id": "submit", "kind": "submit", "label": "Submit the login form", "gate": true, "target": "form.login-form button" }
  ]
}
`;

/** The forms recipe fillcheckout — advanced, 5 steps over https://checkout.test against the checkout.html page, 7000 ms expected, kinds observe, readforms, runwizard, fillform, submit, consent classes payment: Walk the checkout wizard, fill the payment details behind the payment class consent and submit the form. */
export const fillcheckout = `{
  "version": "2.0.0",
  "goal": "Fill the checkout wizard of the gallery fixture checkout",
  "origin": "https://checkout.test",
  "grants": ["observe", "readforms", "runwizard", "fillform", "submit"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the checkout wizard" },
    { "id": "fields", "kind": "readforms", "label": "Read the checkout form controls" },
    { "id": "wizard", "kind": "runwizard", "label": "Walk the checkout wizard steps", "gate": true, "options": "{\\"steps\\":[\\"address\\",\\"shipping\\",\\"review\\"]}" },
    { "id": "fill", "kind": "fillform", "label": "Fill the payment details", "gate": true, "target": "form.checkout-form", "options": "{\\"fields\\":[{\\"name\\":\\"name\\"},{\\"name\\":\\"address\\"},{\\"name\\":\\"city\\"},{\\"name\\":\\"cardnumber\\"}]}" },
    { "id": "submit", "kind": "submit", "label": "Submit the checkout form", "gate": true, "target": "form.checkout-form button" }
  ]
}
`;

/** The forms recipe fillregistration — starter, 4 steps over https://checkout.test against the checkout.html page, 2000 ms expected, kinds observe, readforms, fillform, submit: Read and fill the fixture registration form, then submit it behind its reviewed gates. */
export const fillregistration = `{
  "version": "2.0.0",
  "goal": "Fill the registration form of the gallery fixture checkout",
  "origin": "https://checkout.test",
  "grants": ["observe", "readforms", "fillform", "submit"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the registration form" },
    { "id": "fields", "kind": "readforms", "label": "Read the registration controls" },
    { "id": "fill", "kind": "fillform", "label": "Fill the registration details", "gate": true, "target": "form.registration-form", "options": "{\\"fields\\":[{\\"name\\":\\"fullname\\"},{\\"name\\":\\"email\\"},{\\"name\\":\\"phone\\"}]}" },
    { "id": "submit", "kind": "submit", "label": "Submit the registration form", "gate": true, "target": "form.registration-form button" }
  ]
}
`;

/** The forms recipe fillsearchfilters — starter, 4 steps over https://productgrid.test against the product-grid.html page, 2200 ms expected, kinds observe, detectfields, fillform, click: Detect the store filter fields, fill the reviewed values and apply the filters. */
export const fillsearchfilters = `{
  "version": "2.0.0",
  "goal": "Fill the search filters of the gallery fixture store",
  "origin": "https://productgrid.test",
  "grants": ["observe", "detectfields", "fillform", "click"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the search filters" },
    { "id": "fields", "kind": "detectfields", "label": "Detect the filter fields" },
    { "id": "fill", "kind": "fillform", "label": "Fill the filter values", "gate": true, "target": "form.filter-form", "options": "{\\"fields\\":[{\\"name\\":\\"category\\"},{\\"name\\":\\"maxprice\\"}]}" },
    { "id": "apply", "kind": "click", "label": "Apply the search filters", "gate": true, "target": "form.filter-form button" }
  ]
}
`;

/** The forms recipe fillmultistepwizard — advanced, 5 steps over https://checkout.test against the checkout.html page, 6200 ms expected, kinds observe, readforms, runwizard, fillform, submit: Walk the three step delivery wizard, fill the delivery details and submit the wizard. */
export const fillmultistepwizard = `{
  "version": "2.0.0",
  "goal": "Fill the multi step delivery wizard of the gallery fixture checkout",
  "origin": "https://checkout.test",
  "grants": ["observe", "readforms", "runwizard", "fillform", "submit"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the delivery wizard" },
    { "id": "fields", "kind": "readforms", "label": "Read the wizard form controls" },
    { "id": "wizard", "kind": "runwizard", "label": "Walk the delivery wizard steps", "gate": true, "options": "{\\"steps\\":[\\"address\\",\\"delivery\\",\\"confirm\\"]}" },
    { "id": "fill", "kind": "fillform", "label": "Fill the delivery details", "gate": true, "target": "form.wizard-form", "options": "{\\"fields\\":[{\\"name\\":\\"name\\"},{\\"name\\":\\"street\\"},{\\"name\\":\\"city\\"}]}" },
    { "id": "submit", "kind": "submit", "label": "Submit the delivery wizard", "gate": true, "target": "form.wizard-form button" }
  ]
}
`;

/** The forms recipe filldependentdropdowns — advanced, 4 steps over https://checkout.test against the checkout.html page, 5800 ms expected, kinds observe, readforms, selectchain, submit: Select the region and the dependent city through the reviewed select chain, then submit the form. */
export const filldependentdropdowns = `{
  "version": "2.0.0",
  "goal": "Fill the dependent dropdowns of the gallery fixture checkout",
  "origin": "https://checkout.test",
  "grants": ["observe", "readforms", "selectchain", "submit"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the dependent dropdowns" },
    { "id": "fields", "kind": "readforms", "label": "Read the dropdown controls" },
    { "id": "chain", "kind": "selectchain", "label": "Select the region then the city", "gate": true, "target": "form.dropdown-form select", "options": "{\\"chain\\":[{\\"select\\":\\"#region\\",\\"value\\":\\"north\\"},{\\"select\\":\\"#city\\",\\"value\\":\\"harbor\\"}]}" },
    { "id": "submit", "kind": "submit", "label": "Submit the dropdown form", "gate": true, "target": "form.dropdown-form button" }
  ]
}
`;

/** The forms recipe filltypeahead — intermediate, 3 steps over https://productgrid.test against the product-grid.html page, 3300 ms expected, kinds observe, waitelement, picktypeahead: Wait for the typeahead search input and pick the suggested product from the reviewed options. */
export const filltypeahead = `{
  "version": "2.0.0",
  "goal": "Fill the typeahead search of the gallery fixture store",
  "origin": "https://productgrid.test",
  "grants": ["observe", "waitelement", "picktypeahead"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the typeahead search" },
    { "id": "ready", "kind": "waitelement", "label": "Wait for the search input", "target": ".search input", "options": "{\\"wait\\":1500}" },
    { "id": "pick", "kind": "picktypeahead", "label": "Pick the suggested product", "gate": true, "target": ".search input", "value": "lumen desk lamp" }
  ]
}
`;

/** The forms recipe fillcalendar — intermediate, 4 steps over https://checkout.test against the checkout.html page, 3100 ms expected, kinds observe, readforms, pickdate, submit: Read the delivery calendar control, pick the reviewed delivery date and submit the form. */
export const fillcalendar = `{
  "version": "2.0.0",
  "goal": "Fill the delivery calendar of the gallery fixture checkout",
  "origin": "https://checkout.test",
  "grants": ["observe", "readforms", "pickdate", "submit"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the delivery calendar" },
    { "id": "fields", "kind": "readforms", "label": "Read the calendar control" },
    { "id": "pick", "kind": "pickdate", "label": "Pick the delivery date", "gate": true, "target": "input[name=delivery]", "value": "2026-04-18" },
    { "id": "submit", "kind": "submit", "label": "Submit the delivery date", "gate": true, "target": "form.calendar-form button" }
  ]
}
`;

/** The forms recipe fillfromcsv — advanced, 5 steps over https://checkout.test against the checkout.html page, 6800 ms expected, kinds importcsv, looprows, readforms, fillform, submit: Import the address csv rows, iterate them and fill the registration form from each reviewed row. */
export const fillfromcsv = `{
  "version": "2.0.0",
  "goal": "Fill the csv driven form of the gallery fixture checkout",
  "origin": "https://checkout.test",
  "grants": ["importcsv", "looprows", "readforms", "fillform", "submit"],
  "steps": [
    { "id": "rows", "kind": "importcsv", "label": "Import the address csv rows", "options": "{\\"path\\":\\"gallery/checkout-addresses.csv\\"}" },
    { "id": "iterate", "kind": "looprows", "label": "Iterate the csv rows" },
    { "id": "fields", "kind": "readforms", "label": "Read the csv driven form controls" },
    { "id": "fill", "kind": "fillform", "label": "Fill the form from the csv row", "gate": true, "target": "form.registration-form", "options": "{\\"fields\\":[{\\"name\\":\\"fullname\\"},{\\"name\\":\\"email\\"},{\\"name\\":\\"phone\\"}]}" },
    { "id": "submit", "kind": "submit", "label": "Submit the csv driven form", "gate": true, "target": "form.registration-form button" }
  ]
}
`;

/** The testing recipe testlinkcheck — starter, 4 steps over https://productgrid.test against the product-grid.html page, 1800 ms expected, kinds observe, readlinks, countelements, detecthttp: Read the fixture links, count the anchors and check their protocols for the broken link report. */
export const testlinkcheck = `{
  "version": "2.0.0",
  "goal": "Check the links of the gallery fixture store",
  "origin": "https://productgrid.test",
  "grants": ["observe", "readlinks", "countelements", "detecthttp"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the linked page" },
    { "id": "links", "kind": "readlinks", "label": "Read the page links" },
    { "id": "anchors", "kind": "countelements", "label": "Count the page anchors", "target": ".product-grid a" },
    { "id": "protocols", "kind": "detecthttp", "label": "Check the link protocols" }
  ]
}
`;

/** The testing recipe testconsoleerrors — starter, 4 steps over https://dashboard.test against the dashboard.html page, 1900 ms expected, kinds observe, watchconsole, watcherrors, readerrors: Watch the fixture console output and runtime errors, then read the error report. */
export const testconsoleerrors = `{
  "version": "2.0.0",
  "goal": "Check the console errors of the gallery fixture dashboard",
  "origin": "https://dashboard.test",
  "grants": ["observe", "watchconsole", "watcherrors", "readerrors"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the dashboard page" },
    { "id": "console", "kind": "watchconsole", "label": "Watch the console output" },
    { "id": "errors", "kind": "watcherrors", "label": "Watch the runtime errors" },
    { "id": "report", "kind": "readerrors", "label": "Read the error report" }
  ]
}
`;

/** The testing recipe testformvalidation — intermediate, 5 steps over https://checkout.test against the checkout.html page, 3500 ms expected, kinds observe, readforms, detectfields, readerrors, verifyvisible: Read the fixture form shapes and validation errors, then verify the error banner renders. */
export const testformvalidation = `{
  "version": "2.0.0",
  "goal": "Test the form validation of the gallery fixture checkout",
  "origin": "https://checkout.test",
  "grants": ["observe", "readforms", "detectfields", "readerrors", "verifyvisible"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the validated form" },
    { "id": "fields", "kind": "readforms", "label": "Read the form controls" },
    { "id": "shapes", "kind": "detectfields", "label": "Detect the field shapes" },
    { "id": "errors", "kind": "readerrors", "label": "Read the validation errors" },
    { "id": "banner", "kind": "verifyvisible", "label": "Verify the error banner renders", "target": ".form-error" }
  ]
}
`;

/** The testing recipe testlayoutshift — advanced, 4 steps over https://dashboard.test against the dashboard.html page, 6400 ms expected, kinds observe, watchshifts, traceload, measureflow: Watch the dashboard layout shifts, trace the load timeline and measure the render flow. */
export const testlayoutshift = `{
  "version": "2.0.0",
  "goal": "Test the layout shift of the gallery fixture dashboard",
  "origin": "https://dashboard.test",
  "grants": ["observe", "watchshifts", "traceload", "measureflow"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the shifting dashboard" },
    { "id": "shifts", "kind": "watchshifts", "label": "Watch the layout shifts" },
    { "id": "load", "kind": "traceload", "label": "Trace the load timeline" },
    { "id": "flow", "kind": "measureflow", "label": "Measure the render flow" }
  ]
}
`;

/** The testing recipe testvisualdiff — intermediate, 4 steps over https://productgrid.test against the product-grid.html page, 3700 ms expected, kinds observe, shotview, shotelement, diffsnapshots: Capture the viewport and gallery element snapshots, then diff them for the regression report. */
export const testvisualdiff = `{
  "version": "2.0.0",
  "goal": "Run the visual regression check of the gallery fixture store",
  "origin": "https://productgrid.test",
  "grants": ["observe", "shotview", "shotelement", "diffsnapshots"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the gallery store page" },
    { "id": "viewport", "kind": "shotview", "label": "Capture the viewport snapshot" },
    { "id": "element", "kind": "shotelement", "label": "Capture the gallery element snapshot", "target": ".gallery" },
    { "id": "diff", "kind": "diffsnapshots", "label": "Diff the captured snapshots" }
  ]
}
`;

/** The testing recipe testloadtiming — intermediate, 4 steps over https://dashboard.test against the dashboard.html page, 3900 ms expected, kinds observe, traceload, measureflow, watchrequests: Trace the dashboard load timeline, measure the render flow and watch the page requests. */
export const testloadtiming = `{
  "version": "2.0.0",
  "goal": "Test the load timing of the gallery fixture dashboard",
  "origin": "https://dashboard.test",
  "grants": ["observe", "traceload", "measureflow", "watchrequests"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the timed dashboard" },
    { "id": "load", "kind": "traceload", "label": "Trace the load timeline" },
    { "id": "flow", "kind": "measureflow", "label": "Measure the render flow" },
    { "id": "requests", "kind": "watchrequests", "label": "Watch the page requests" }
  ]
}
`;

/** The testing recipe testaccessibility — starter, 4 steps over https://productgrid.test against the product-grid.html page, 2100 ms expected, kinds readertree, readoutline, readmeta, verifyvisible: Read the reader tree, the heading outline and the metadata, then verify the gallery labels render. */
export const testaccessibility = `{
  "version": "2.0.0",
  "goal": "Check the accessibility of the gallery fixture store",
  "origin": "https://productgrid.test",
  "grants": [
    "readertree",
    "readoutline",
    "readmeta",
    "verifyvisible"
  ],
  "steps": [
    {
      "id": "tree",
      "kind": "readertree",
      "label": "Read the reader tree of the page"
    },
    {
      "id": "outline",
      "kind": "readoutline",
      "label": "Read the heading outline"
    },
    {
      "id": "meta",
      "kind": "readmeta",
      "label": "Read the page metadata"
    },
    {
      "id": "labels",
      "kind": "verifyvisible",
      "label": "Verify the gallery labels render",
      "target": ".gallery img"
    }
  ]
}
`;

/** The testing recipe testdeeplinks — intermediate, 4 steps over https://dashboard.test against the dashboard.html page, 3300 ms expected, kinds observe, readlinks, readfinalurl, countpages: Read the deep link anchors, resolve their final urls and count the covered pages. */
export const testdeeplinks = `{
  "version": "2.0.0",
  "goal": "Test the deep link coverage of the gallery fixture dashboard",
  "origin": "https://dashboard.test",
  "grants": ["observe", "readlinks", "readfinalurl", "countpages"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the deep linked dashboard" },
    { "id": "links", "kind": "readlinks", "label": "Read the deep link anchors" },
    { "id": "final", "kind": "readfinalurl", "label": "Read the final url of the links" },
    { "id": "pages", "kind": "countpages", "label": "Count the deep link pages" }
  ]
}
`;

/** The monitoring recipe monitorpricechange — intermediate, 3 steps over https://dashboard.test against the dashboard.html page, 3400 ms expected, kinds observe, readtext, watchmutate: Monitor the fixture price ticker: read the current prices and watch the mutations on the reviewed schedule. */
export const monitorpricechange = `{
  "version": "2.0.0",
  "goal": "Monitor the price changes of the gallery fixture dashboard",
  "origin": "https://dashboard.test",
  "grants": ["observe", "readtext", "watchmutate"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the price ticker" },
    { "id": "prices", "kind": "readtext", "label": "Read the current prices", "target": ".price-ticker" },
    { "id": "changes", "kind": "watchmutate", "label": "Watch the price mutations" }
  ]
}
`;

/** The monitoring recipe monitoravailability — starter, 3 steps over https://dashboard.test against the dashboard.html page, 2000 ms expected, kinds observe, verifyvisible, watchbanner: Monitor the availability badge and the status banners on the reviewed schedule. */
export const monitoravailability = `{
  "version": "2.0.0",
  "goal": "Monitor the availability of the gallery fixture dashboard",
  "origin": "https://dashboard.test",
  "grants": ["observe", "verifyvisible", "watchbanner"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the availability badge" },
    { "id": "badge", "kind": "verifyvisible", "label": "Verify the availability badge renders", "target": ".availability" },
    { "id": "banner", "kind": "watchbanner", "label": "Watch the status banners" }
  ]
}
`;

/** The monitoring recipe monitornetworkquiet — intermediate, 4 steps over https://dashboard.test against the dashboard.html page, 3800 ms expected, kinds observe, watchrequests, waitquiet, readerrors: Watch the page requests, wait for the network quiet and read the error report on the reviewed schedule. */
export const monitornetworkquiet = `{
  "version": "2.0.0",
  "goal": "Monitor the network quiet of the gallery fixture dashboard",
  "origin": "https://dashboard.test",
  "grants": ["observe", "watchrequests", "waitquiet", "readerrors"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the busy dashboard" },
    { "id": "requests", "kind": "watchrequests", "label": "Watch the page requests" },
    { "id": "quiet", "kind": "waitquiet", "label": "Wait for the network quiet" },
    { "id": "errors", "kind": "readerrors", "label": "Read the error report" }
  ]
}
`;

/** The monitoring recipe monitorpagechanges — advanced, 3 steps over https://feed.test against the feed.html page, 6100 ms expected, kinds observe, watchmutate, diffsnapshots: Watch the feed mutations and diff the changing snapshots on the hourly schedule. */
export const monitorpagechanges = `{
  "version": "2.0.0",
  "goal": "Monitor the page changes of the gallery fixture feed",
  "origin": "https://feed.test",
  "grants": ["observe", "watchmutate", "diffsnapshots"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the changing feed" },
    { "id": "changes", "kind": "watchmutate", "label": "Watch the feed mutations" },
    { "id": "diff", "kind": "diffsnapshots", "label": "Diff the changing snapshots" }
  ]
}
`;

/** The monitoring recipe monitorschedule — intermediate, 4 steps over https://dashboard.test against the dashboard.html page, 3600 ms expected, kinds observe, intervalrule, readtext, watchmutate: Run the reviewed monitoring interval, read the prices and watch the mutations on the declared cadence. */
export const monitorschedule = `{
  "version": "2.0.0",
  "goal": "Monitor the gallery fixture dashboard on its reviewed schedule",
  "origin": "https://dashboard.test",
  "grants": ["observe", "intervalrule", "readtext", "watchmutate"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the scheduled dashboard" },
    { "id": "cadence", "kind": "intervalrule", "label": "Run the reviewed monitoring interval", "gate": true, "options": "{\\"interval\\":300000}" },
    { "id": "prices", "kind": "readtext", "label": "Read the current prices", "target": ".price-ticker" },
    { "id": "changes", "kind": "watchmutate", "label": "Watch the price mutations" }
  ]
}
`;

/** The monitoring recipe monitoralerts — advanced, 4 steps over https://dashboard.test against the dashboard.html page, 5900 ms expected, kinds observe, watchconsole, watchbanner, readerrors: Watch the console alerts and the alert banners, then read the alert report on the tight reviewed schedule. */
export const monitoralerts = `{
  "version": "2.0.0",
  "goal": "Monitor the alert feed of the gallery fixture dashboard",
  "origin": "https://dashboard.test",
  "grants": ["observe", "watchconsole", "watchbanner", "readerrors"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the alerting dashboard" },
    { "id": "console", "kind": "watchconsole", "label": "Watch the console alerts" },
    { "id": "banner", "kind": "watchbanner", "label": "Watch the alert banners" },
    { "id": "errors", "kind": "readerrors", "label": "Read the alert report" }
  ]
}
`;

/** The agents recipe agentswarm — advanced, 3 steps over https://productgrid.test against the product-grid.html page, 7200 ms expected, kinds observe, parallel, readtext, countelements, exportjson: The multi agent scrape swarm: the scout reads the grid copy while the ledger counts the cards, joined first, then the findings export. */
export const agentswarm = `{
  "version": "2.0.0",
  "goal": "Run the multi agent scrape swarm over the gallery fixture store",
  "origin": "https://productgrid.test",
  "grants": ["observe", "parallel", "readtext", "countelements", "exportjson"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the store page for the swarm" },
    { "id": "swarm", "kind": "parallel", "label": "Scout the grid copy and ledger the cards in parallel", "options": "{\\"parallel\\":{\\"branches\\":[{\\"id\\":\\"scout\\",\\"steps\\":[{\\"id\\":\\"grid\\",\\"kind\\":\\"readtext\\",\\"label\\":\\"Read the grid copy\\",\\"target\\":\\".product-grid article h3\\"}]},{\\"id\\":\\"ledger\\",\\"steps\\":[{\\"id\\":\\"cards\\",\\"kind\\":\\"countelements\\",\\"label\\":\\"Count the product cards\\",\\"target\\":\\".product-grid article\\"}]}],\\"join\\":{\\"strategy\\":\\"first\\",\\"onfail\\":\\"continue\\"}}}" },
    { "id": "export", "kind": "exportjson", "label": "Export the swarm findings", "gate": true, "options": "{\\"name\\":\\"swarm-findings\\"}" }
  ]
}
`;

/** The agents recipe agentsreview — intermediate, 3 steps over https://productgrid.test against the product-grid.html page, 3500 ms expected, kinds observe, readtable, condition: The planner critic review: the critic reads the extraction table and grades the verdict through the reviewed condition. */
export const agentsreview = `{
  "version": "2.0.0",
  "goal": "Run the planner critic review over the gallery fixture extraction",
  "origin": "https://productgrid.test",
  "grants": [
    "observe",
    "readtable",
    "condition"
  ],
  "steps": [
    {
      "id": "observe",
      "kind": "observe",
      "label": "Observe the extraction under review"
    },
    {
      "id": "table",
      "kind": "readtable",
      "label": "Read the extraction table",
      "target": "table.price-table"
    },
    {
      "id": "verdict",
      "kind": "condition",
      "label": "Grade the extraction verdict",
      "options": "{\\"condition\\":{\\"expression\\":{\\"left\\":{\\"literal\\":1},\\"operator\\":\\"less\\",\\"right\\":{\\"literal\\":2},\\"result\\":\\"verdict\\",\\"resultkind\\":\\"boolean\\"}}}"
    }
  ]
}
`;

/** The agents recipe agentsforms — advanced, 3 steps over https://checkout.test against the checkout.html page, 7500 ms expected, kinds observe, parallel, fillform, submit: The parallel form fill: the login lane and the register lane fill their forms concurrently, joined last, then the submit. */
export const agentsforms = `{
  "version": "2.0.0",
  "goal": "Run the parallel form fill over the gallery fixture checkout",
  "origin": "https://checkout.test",
  "grants": ["observe", "parallel", "fillform", "submit"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the forms for the parallel fill" },
    { "id": "forms", "kind": "parallel", "label": "Fill the login and registration forms in parallel", "options": "{\\"parallel\\":{\\"branches\\":[{\\"id\\":\\"loginlane\\",\\"steps\\":[{\\"id\\":\\"loginfill\\",\\"kind\\":\\"fillform\\",\\"label\\":\\"Fill the login form\\",\\"target\\":\\"form.login-form\\"}]},{\\"id\\":\\"registerlane\\",\\"steps\\":[{\\"id\\":\\"registerfill\\",\\"kind\\":\\"fillform\\",\\"label\\":\\"Fill the registration form\\",\\"target\\":\\"form.registration-form\\"}]}],\\"join\\":{\\"strategy\\":\\"last\\",\\"onfail\\":\\"continue\\"}}}" },
    { "id": "submit", "kind": "submit", "label": "Submit the filled forms", "gate": true, "target": "form.login-form button" }
  ]
}
`;

/** The agents recipe agentsmonitor — advanced, 3 steps over https://feed.test against the feed.html page, 6900 ms expected, kinds observe, watchmutate, parallel, readtext, readscrollpos: The monitoring swarm: the text lane and the scroll lane watch the feed concurrently while the mutations stream. */
export const agentsmonitor = `{
  "version": "2.0.0",
  "goal": "Run the monitoring swarm over the gallery fixture feed",
  "origin": "https://feed.test",
  "grants": ["observe", "watchmutate", "parallel", "readtext", "readscrollpos"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the feed for the monitoring swarm" },
    { "id": "watch", "kind": "watchmutate", "label": "Watch the feed mutations" },
    { "id": "lanes", "kind": "parallel", "label": "Watch the feed text and the scroll position in parallel", "options": "{\\"parallel\\":{\\"branches\\":[{\\"id\\":\\"textlane\\",\\"steps\\":[{\\"id\\":\\"feedtext\\",\\"kind\\":\\"readtext\\",\\"label\\":\\"Read the feed cards\\",\\"target\\":\\".feed article\\"}]},{\\"id\\":\\"scrolllane\\",\\"steps\\":[{\\"id\\":\\"scrollpos\\",\\"kind\\":\\"readscrollpos\\",\\"label\\":\\"Read the feed scroll position\\"}]}],\\"join\\":{\\"strategy\\":\\"first\\",\\"onfail\\":\\"cancel\\"}}}" }
  ]
}
`;

/** The agents recipe agentscompete — advanced, 3 steps over https://productgrid.test against the product-grid.html page, 7800 ms expected, kinds observe, parallel, readtext, scrapetable, exportjson: The competing extraction: the text agent races the table agent over the same store page, joined first, then the winning export. */
export const agentscompete = `{
  "version": "2.0.0",
  "goal": "Run the competing extraction agents over the gallery fixture store",
  "origin": "https://productgrid.test",
  "grants": ["observe", "parallel", "readtext", "scrapetable", "exportjson"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the store page for the competing agents" },
    { "id": "compete", "kind": "parallel", "label": "Race the text read against the table scrape", "options": "{\\"parallel\\":{\\"branches\\":[{\\"id\\":\\"textagent\\",\\"steps\\":[{\\"id\\":\\"gridtext\\",\\"kind\\":\\"readtext\\",\\"label\\":\\"Read the grid copy\\",\\"target\\":\\".product-grid article h3\\"}]},{\\"id\\":\\"tableagent\\",\\"steps\\":[{\\"id\\":\\"pricetable\\",\\"kind\\":\\"scrapetable\\",\\"label\\":\\"Scrape the price table\\",\\"target\\":\\"table.price-table\\"}]}],\\"join\\":{\\"strategy\\":\\"first\\",\\"onfail\\":\\"continue\\"}}}" },
    { "id": "export", "kind": "exportjson", "label": "Export the winning extraction", "gate": true, "options": "{\\"name\\":\\"compete-result\\"}" }
  ]
}
`;

/** The gallery index of the 36 recipes — the metadata the runner validates and the cli recipes command reads (the categories, the difficulties, the fixture page declarations with their local origins, the expected durations, the capabilities, the consent classes, the kinds and the export format, schedule and topology fields of every family), exactly the text the former tests/code/recipes/gallery.json carried. */
export const gallery = `{
  "version": "2.0.0",
  "description": "The gallery index of the 36 example recipes the 2.0.0 example gallery ships: every entry names its plan file, its category, its difficulty, its fixture page, its local origin, its expected dry run duration, the optional capabilities it needs, the sensitive class consents its review demands, the action kinds it exercises and the category field its family requires (the export format of the scraping recipes, the schedule of the monitoring recipes and the topology of the agent recipes). The recipes themselves stay pure plan files the schemastrict plan grammar owns; this index carries the gallery metadata so the recipe documents never widen the frozen plan schema.",
  "fixturepages": [
    {
      "name": "product-grid.html",
      "origin": "https://productgrid.test",
      "features": [
        "product grid",
        "pagination controls",
        "lazy images",
        "price table",
        "review list",
        "image gallery",
        "filter form",
        "typeahead search"
      ]
    },
    {
      "name": "checkout.html",
      "origin": "https://checkout.test",
      "features": [
        "login form",
        "checkout wizard",
        "registration form",
        "dependent dropdowns",
        "delivery calendar",
        "validation errors"
      ]
    },
    {
      "name": "dashboard.html",
      "origin": "https://dashboard.test",
      "features": [
        "price ticker",
        "timers",
        "toasts",
        "console noise",
        "availability badge",
        "deep links",
        "network quiet"
      ]
    },
    {
      "name": "feed.html",
      "origin": "https://feed.test",
      "features": [
        "infinite scroll",
        "delayed loads",
        "search results",
        "nested comment tree"
      ]
    }
  ],
  "entries": [
    {
      "id": "scrapeproductgrid",
      "category": "scraping",
      "difficulty": "starter",
      "description": "Count and read the product cards of the fixture store, then export the grid inventory as json.",
      "fixture": "product-grid.html",
      "origin": "https://productgrid.test",
      "expecteddurationms": 1600,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "countelements",
        "readtext",
        "exportjson"
      ],
      "exportformat": "json"
    },
    {
      "id": "scrapetablepagination",
      "category": "scraping",
      "difficulty": "starter",
      "description": "Scrape the paginated price table and export its rows as csv beside the page count.",
      "fixture": "product-grid.html",
      "origin": "https://productgrid.test",
      "expecteddurationms": 1800,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "scrapetable",
        "countpages",
        "exportcsv"
      ],
      "exportformat": "csv"
    },
    {
      "id": "scrapereviews",
      "category": "scraping",
      "difficulty": "intermediate",
      "description": "Count and read the fixture reviews, then export the review digest as json.",
      "fixture": "product-grid.html",
      "origin": "https://productgrid.test",
      "expecteddurationms": 3200,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "countelements",
        "readtext",
        "exportjson"
      ],
      "exportformat": "json"
    },
    {
      "id": "scrapesearchresults",
      "category": "scraping",
      "difficulty": "starter",
      "description": "Read the fixture search result links and metadata, then export the result set as json.",
      "fixture": "feed.html",
      "origin": "https://feed.test",
      "expecteddurationms": 1700,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "readlinks",
        "readmeta",
        "exportjson"
      ],
      "exportformat": "json"
    },
    {
      "id": "scrapenestedlists",
      "category": "scraping",
      "difficulty": "intermediate",
      "description": "Detect and read the nested comment tree, then export the tree outline as an excel sheet.",
      "fixture": "feed.html",
      "origin": "https://feed.test",
      "expecteddurationms": 3400,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "detectlists",
        "readhtml",
        "exportexcel"
      ],
      "exportformat": "excel"
    },
    {
      "id": "scrapeinfinitefeed",
      "category": "scraping",
      "difficulty": "advanced",
      "description": "Detect the infinite scroll sentinel, read the feed cards and export the feed capture as json.",
      "fixture": "feed.html",
      "origin": "https://feed.test",
      "expecteddurationms": 6500,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "detectinfinitescroll",
        "readscrollpos",
        "readtext",
        "exportjson"
      ],
      "exportformat": "json"
    },
    {
      "id": "scrapedynamicprices",
      "category": "scraping",
      "difficulty": "intermediate",
      "description": "Wait for the live price ticker, read the prices, watch the mutations and export the series as csv.",
      "fixture": "dashboard.html",
      "origin": "https://dashboard.test",
      "expecteddurationms": 3800,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "waitelement",
        "readtext",
        "watchmutate",
        "exportcsv"
      ],
      "exportformat": "csv"
    },
    {
      "id": "scrapeimagegallery",
      "category": "scraping",
      "difficulty": "intermediate",
      "description": "Read the fixture image gallery inventory, verify the images render and export the asset manifest as csv.",
      "fixture": "product-grid.html",
      "origin": "https://productgrid.test",
      "expecteddurationms": 3000,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "readimages",
        "verifyvisible",
        "exportcsv"
      ],
      "exportformat": "csv"
    },
    {
      "id": "fillloginform",
      "category": "forms",
      "difficulty": "intermediate",
      "description": "The consented login form recipe: the credential class consent the review demands before the login fill runs.",
      "fixture": "checkout.html",
      "origin": "https://checkout.test",
      "expecteddurationms": 3600,
      "capabilities": [],
      "consentclasses": [
        "credential"
      ],
      "kinds": [
        "observe",
        "readforms",
        "fillform",
        "submit"
      ]
    },
    {
      "id": "fillcheckout",
      "category": "forms",
      "difficulty": "advanced",
      "description": "Walk the checkout wizard, fill the payment details behind the payment class consent and submit the form.",
      "fixture": "checkout.html",
      "origin": "https://checkout.test",
      "expecteddurationms": 7000,
      "capabilities": [],
      "consentclasses": [
        "payment"
      ],
      "kinds": [
        "observe",
        "readforms",
        "runwizard",
        "fillform",
        "submit"
      ]
    },
    {
      "id": "fillregistration",
      "category": "forms",
      "difficulty": "starter",
      "description": "Read and fill the fixture registration form, then submit it behind its reviewed gates.",
      "fixture": "checkout.html",
      "origin": "https://checkout.test",
      "expecteddurationms": 2000,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "readforms",
        "fillform",
        "submit"
      ]
    },
    {
      "id": "fillsearchfilters",
      "category": "forms",
      "difficulty": "starter",
      "description": "Detect the store filter fields, fill the reviewed values and apply the filters.",
      "fixture": "product-grid.html",
      "origin": "https://productgrid.test",
      "expecteddurationms": 2200,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "detectfields",
        "fillform",
        "click"
      ]
    },
    {
      "id": "fillmultistepwizard",
      "category": "forms",
      "difficulty": "advanced",
      "description": "Walk the three step delivery wizard, fill the delivery details and submit the wizard.",
      "fixture": "checkout.html",
      "origin": "https://checkout.test",
      "expecteddurationms": 6200,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "readforms",
        "runwizard",
        "fillform",
        "submit"
      ]
    },
    {
      "id": "filldependentdropdowns",
      "category": "forms",
      "difficulty": "advanced",
      "description": "Select the region and the dependent city through the reviewed select chain, then submit the form.",
      "fixture": "checkout.html",
      "origin": "https://checkout.test",
      "expecteddurationms": 5800,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "readforms",
        "selectchain",
        "submit"
      ]
    },
    {
      "id": "filltypeahead",
      "category": "forms",
      "difficulty": "intermediate",
      "description": "Wait for the typeahead search input and pick the suggested product from the reviewed options.",
      "fixture": "product-grid.html",
      "origin": "https://productgrid.test",
      "expecteddurationms": 3300,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "waitelement",
        "picktypeahead"
      ]
    },
    {
      "id": "fillcalendar",
      "category": "forms",
      "difficulty": "intermediate",
      "description": "Read the delivery calendar control, pick the reviewed delivery date and submit the form.",
      "fixture": "checkout.html",
      "origin": "https://checkout.test",
      "expecteddurationms": 3100,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "readforms",
        "pickdate",
        "submit"
      ]
    },
    {
      "id": "fillfromcsv",
      "category": "forms",
      "difficulty": "advanced",
      "description": "Import the address csv rows, iterate them and fill the registration form from each reviewed row.",
      "fixture": "checkout.html",
      "origin": "https://checkout.test",
      "expecteddurationms": 6800,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "importcsv",
        "looprows",
        "readforms",
        "fillform",
        "submit"
      ]
    },
    {
      "id": "testlinkcheck",
      "category": "testing",
      "difficulty": "starter",
      "description": "Read the fixture links, count the anchors and check their protocols for the broken link report.",
      "fixture": "product-grid.html",
      "origin": "https://productgrid.test",
      "expecteddurationms": 1800,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "readlinks",
        "countelements",
        "detecthttp"
      ]
    },
    {
      "id": "testconsoleerrors",
      "category": "testing",
      "difficulty": "starter",
      "description": "Watch the fixture console output and runtime errors, then read the error report.",
      "fixture": "dashboard.html",
      "origin": "https://dashboard.test",
      "expecteddurationms": 1900,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "watchconsole",
        "watcherrors",
        "readerrors"
      ]
    },
    {
      "id": "testformvalidation",
      "category": "testing",
      "difficulty": "intermediate",
      "description": "Read the fixture form shapes and validation errors, then verify the error banner renders.",
      "fixture": "checkout.html",
      "origin": "https://checkout.test",
      "expecteddurationms": 3500,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "readforms",
        "detectfields",
        "readerrors",
        "verifyvisible"
      ]
    },
    {
      "id": "testlayoutshift",
      "category": "testing",
      "difficulty": "advanced",
      "description": "Watch the dashboard layout shifts, trace the load timeline and measure the render flow.",
      "fixture": "dashboard.html",
      "origin": "https://dashboard.test",
      "expecteddurationms": 6400,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "watchshifts",
        "traceload",
        "measureflow"
      ]
    },
    {
      "id": "testvisualdiff",
      "category": "testing",
      "difficulty": "intermediate",
      "description": "Capture the viewport and gallery element snapshots, then diff them for the regression report.",
      "fixture": "product-grid.html",
      "origin": "https://productgrid.test",
      "expecteddurationms": 3700,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "shotview",
        "shotelement",
        "diffsnapshots"
      ]
    },
    {
      "id": "testloadtiming",
      "category": "testing",
      "difficulty": "intermediate",
      "description": "Trace the dashboard load timeline, measure the render flow and watch the page requests.",
      "fixture": "dashboard.html",
      "origin": "https://dashboard.test",
      "expecteddurationms": 3900,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "traceload",
        "measureflow",
        "watchrequests"
      ]
    },
    {
      "id": "testaccessibility",
      "category": "testing",
      "difficulty": "starter",
      "description": "Read the reader tree, the heading outline and the metadata, then verify the gallery labels render.",
      "fixture": "product-grid.html",
      "origin": "https://productgrid.test",
      "expecteddurationms": 2100,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "readertree",
        "readoutline",
        "readmeta",
        "verifyvisible"
      ]
    },
    {
      "id": "testdeeplinks",
      "category": "testing",
      "difficulty": "intermediate",
      "description": "Read the deep link anchors, resolve their final urls and count the covered pages.",
      "fixture": "dashboard.html",
      "origin": "https://dashboard.test",
      "expecteddurationms": 3300,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "readlinks",
        "readfinalurl",
        "countpages"
      ]
    },
    {
      "id": "monitorpricechange",
      "category": "monitoring",
      "difficulty": "intermediate",
      "description": "Monitor the fixture price ticker: read the current prices and watch the mutations on the reviewed schedule.",
      "fixture": "dashboard.html",
      "origin": "https://dashboard.test",
      "expecteddurationms": 3400,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "readtext",
        "watchmutate"
      ],
      "schedule": "*/5 * * * *"
    },
    {
      "id": "monitoravailability",
      "category": "monitoring",
      "difficulty": "starter",
      "description": "Monitor the availability badge and the status banners on the reviewed schedule.",
      "fixture": "dashboard.html",
      "origin": "https://dashboard.test",
      "expecteddurationms": 2000,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "verifyvisible",
        "watchbanner"
      ],
      "schedule": "*/10 * * * *"
    },
    {
      "id": "monitornetworkquiet",
      "category": "monitoring",
      "difficulty": "intermediate",
      "description": "Watch the page requests, wait for the network quiet and read the error report on the reviewed schedule.",
      "fixture": "dashboard.html",
      "origin": "https://dashboard.test",
      "expecteddurationms": 3800,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "watchrequests",
        "waitquiet",
        "readerrors"
      ],
      "schedule": "*/15 * * * *"
    },
    {
      "id": "monitorpagechanges",
      "category": "monitoring",
      "difficulty": "advanced",
      "description": "Watch the feed mutations and diff the changing snapshots on the hourly schedule.",
      "fixture": "feed.html",
      "origin": "https://feed.test",
      "expecteddurationms": 6100,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "watchmutate",
        "diffsnapshots"
      ],
      "schedule": "0 * * * *"
    },
    {
      "id": "monitorschedule",
      "category": "monitoring",
      "difficulty": "intermediate",
      "description": "Run the reviewed monitoring interval, read the prices and watch the mutations on the declared cadence.",
      "fixture": "dashboard.html",
      "origin": "https://dashboard.test",
      "expecteddurationms": 3600,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "intervalrule",
        "readtext",
        "watchmutate"
      ],
      "schedule": "*/5 * * * *"
    },
    {
      "id": "monitoralerts",
      "category": "monitoring",
      "difficulty": "advanced",
      "description": "Watch the console alerts and the alert banners, then read the alert report on the tight reviewed schedule.",
      "fixture": "dashboard.html",
      "origin": "https://dashboard.test",
      "expecteddurationms": 5900,
      "capabilities": [],
      "consentclasses": [],
      "kinds": [
        "observe",
        "watchconsole",
        "watchbanner",
        "readerrors"
      ],
      "schedule": "*/2 * * * *"
    },
    {
      "id": "agentswarm",
      "category": "agents",
      "difficulty": "advanced",
      "description": "The multi agent scrape swarm: the scout reads the grid copy while the ledger counts the cards, joined first, then the findings export.",
      "fixture": "product-grid.html",
      "origin": "https://productgrid.test",
      "expecteddurationms": 7200,
      "capabilities": [
        "tabs"
      ],
      "consentclasses": [],
      "kinds": [
        "observe",
        "parallel",
        "readtext",
        "countelements",
        "exportjson"
      ],
      "topology": "swarm"
    },
    {
      "id": "agentsreview",
      "category": "agents",
      "difficulty": "intermediate",
      "description": "The planner critic review: the critic reads the extraction table and grades the verdict through the reviewed condition.",
      "fixture": "product-grid.html",
      "origin": "https://productgrid.test",
      "expecteddurationms": 3500,
      "capabilities": [
        "tabs"
      ],
      "consentclasses": [],
      "kinds": [
        "observe",
        "readtable",
        "condition"
      ],
      "topology": "review"
    },
    {
      "id": "agentsforms",
      "category": "agents",
      "difficulty": "advanced",
      "description": "The parallel form fill: the login lane and the register lane fill their forms concurrently, joined last, then the submit.",
      "fixture": "checkout.html",
      "origin": "https://checkout.test",
      "expecteddurationms": 7500,
      "capabilities": [
        "tabs"
      ],
      "consentclasses": [],
      "kinds": [
        "observe",
        "parallel",
        "fillform",
        "submit"
      ],
      "topology": "parallel"
    },
    {
      "id": "agentsmonitor",
      "category": "agents",
      "difficulty": "advanced",
      "description": "The monitoring swarm: the text lane and the scroll lane watch the feed concurrently while the mutations stream.",
      "fixture": "feed.html",
      "origin": "https://feed.test",
      "expecteddurationms": 6900,
      "capabilities": [
        "tabs"
      ],
      "consentclasses": [],
      "kinds": [
        "observe",
        "watchmutate",
        "parallel",
        "readtext",
        "readscrollpos"
      ],
      "topology": "monitor"
    },
    {
      "id": "agentscompete",
      "category": "agents",
      "difficulty": "advanced",
      "description": "The competing extraction: the text agent races the table agent over the same store page, joined first, then the winning export.",
      "fixture": "product-grid.html",
      "origin": "https://productgrid.test",
      "expecteddurationms": 7800,
      "capabilities": [
        "tabs"
      ],
      "consentclasses": [],
      "kinds": [
        "observe",
        "parallel",
        "readtext",
        "scrapetable",
        "exportjson"
      ],
      "topology": "compete"
    }
  ]
}
`;

/** Every recipe plan of the gallery keyed by its id, so the gates, the tests and the build iterate the 36 documents without touching the file system. */
export const recipeplans = {
  scrapeproductgrid,
  scrapetablepagination,
  scrapereviews,
  scrapesearchresults,
  scrapenestedlists,
  scrapeinfinitefeed,
  scrapedynamicprices,
  scrapeimagegallery,
  fillloginform,
  fillcheckout,
  fillregistration,
  fillsearchfilters,
  fillmultistepwizard,
  filldependentdropdowns,
  filltypeahead,
  fillcalendar,
  fillfromcsv,
  testlinkcheck,
  testconsoleerrors,
  testformvalidation,
  testlayoutshift,
  testvisualdiff,
  testloadtiming,
  testaccessibility,
  testdeeplinks,
  monitorpricechange,
  monitoravailability,
  monitornetworkquiet,
  monitorpagechanges,
  monitorschedule,
  monitoralerts,
  agentswarm,
  agentsreview,
  agentsforms,
  agentsmonitor,
  agentscompete,
} as const;
