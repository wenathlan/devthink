# Example gallery

Last verified release: the 2.0.0 example gallery release; the recipes gate renews the verification on every run.

The example gallery is the fastest way to start with the library: 36 runnable recipes grouped into the five families the roadmap promised — 8 scraping, 9 forms, 8 testing, 6 monitoring and 5 agent recipes — each one a pure plan file of `tests/code/recipes/` that the gate of `tests/recipes.mjs` validates, lints and dry runs against the four fixture pages of `tests/code/pages/`. The metadata that grades every entry (its category, its difficulty, its fixture page, its consent classes and the category fields its family requires) lives in the gallery index of `tests/code/recipes/gallery.json`, because the frozen plan schema allows no metadata field inside a recipe document. The build copies the whole set into `dist/fixtures/recipes/`, `dist/fixtures/pages/` and `dist/gallery.json` so every package channel ships it, and the verify lane runs `node tests/recipes.mjs` on every release — the recipes can never drift from the code.

## The gallery index

Every entry below names its recipe file, its difficulty grade, its expected dry run duration, its fixture page and the action kinds it exercises. The recipe column links the plan document itself; the kinds column names the exact kind set the gate verifies against the recipe steps, including the child kinds nested in the control payloads.

### scraping recipes

| Recipe | Difficulty | Expected duration | Fixture page | Kinds exercised |
| --- | --- | --- | --- | --- |
| [scrapeproductgrid](../tests/code/recipes/scrapeproductgrid.json) | starter | 1600 ms | product-grid.html | observe, countelements, readtext, exportjson |
| [scrapetablepagination](../tests/code/recipes/scrapetablepagination.json) | starter | 1800 ms | product-grid.html | observe, scrapetable, countpages, exportcsv |
| [scrapereviews](../tests/code/recipes/scrapereviews.json) | intermediate | 3200 ms | product-grid.html | observe, countelements, readtext, exportjson |
| [scrapesearchresults](../tests/code/recipes/scrapesearchresults.json) | starter | 1700 ms | feed.html | observe, readlinks, readmeta, exportjson |
| [scrapenestedlists](../tests/code/recipes/scrapenestedlists.json) | intermediate | 3400 ms | feed.html | observe, detectlists, readhtml, exportexcel |
| [scrapeinfinitefeed](../tests/code/recipes/scrapeinfinitefeed.json) | advanced | 6500 ms | feed.html | observe, detectinfinitescroll, readscrollpos, readtext, exportjson |
| [scrapedynamicprices](../tests/code/recipes/scrapedynamicprices.json) | intermediate | 3800 ms | dashboard.html | observe, waitelement, readtext, watchmutate, exportcsv |
| [scrapeimagegallery](../tests/code/recipes/scrapeimagegallery.json) | intermediate | 3000 ms | product-grid.html | observe, readimages, verifyvisible, exportcsv |

### forms recipes

| Recipe | Difficulty | Expected duration | Fixture page | Kinds exercised |
| --- | --- | --- | --- | --- |
| [fillloginform](../tests/code/recipes/fillloginform.json) | intermediate | 3600 ms | checkout.html | observe, readforms, fillform, submit |
| [fillcheckout](../tests/code/recipes/fillcheckout.json) | advanced | 7000 ms | checkout.html | observe, readforms, runwizard, fillform, submit |
| [fillregistration](../tests/code/recipes/fillregistration.json) | starter | 2000 ms | checkout.html | observe, readforms, fillform, submit |
| [fillsearchfilters](../tests/code/recipes/fillsearchfilters.json) | starter | 2200 ms | product-grid.html | observe, detectfields, fillform, click |
| [fillmultistepwizard](../tests/code/recipes/fillmultistepwizard.json) | advanced | 6200 ms | checkout.html | observe, readforms, runwizard, fillform, submit |
| [filldependentdropdowns](../tests/code/recipes/filldependentdropdowns.json) | advanced | 5800 ms | checkout.html | observe, readforms, selectchain, submit |
| [filltypeahead](../tests/code/recipes/filltypeahead.json) | intermediate | 3300 ms | product-grid.html | observe, waitelement, picktypeahead |
| [fillcalendar](../tests/code/recipes/fillcalendar.json) | intermediate | 3100 ms | checkout.html | observe, readforms, pickdate, submit |
| [fillfromcsv](../tests/code/recipes/fillfromcsv.json) | advanced | 6800 ms | checkout.html | importcsv, looprows, readforms, fillform, submit |

### testing recipes

| Recipe | Difficulty | Expected duration | Fixture page | Kinds exercised |
| --- | --- | --- | --- | --- |
| [testlinkcheck](../tests/code/recipes/testlinkcheck.json) | starter | 1800 ms | product-grid.html | observe, readlinks, countelements, detecthttp |
| [testconsoleerrors](../tests/code/recipes/testconsoleerrors.json) | starter | 1900 ms | dashboard.html | observe, watchconsole, watcherrors, readerrors |
| [testformvalidation](../tests/code/recipes/testformvalidation.json) | intermediate | 3500 ms | checkout.html | observe, readforms, detectfields, readerrors, verifyvisible |
| [testlayoutshift](../tests/code/recipes/testlayoutshift.json) | advanced | 6400 ms | dashboard.html | observe, watchshifts, traceload, measureflow |
| [testvisualdiff](../tests/code/recipes/testvisualdiff.json) | intermediate | 3700 ms | product-grid.html | observe, shotview, shotelement, diffsnapshots |
| [testloadtiming](../tests/code/recipes/testloadtiming.json) | intermediate | 3900 ms | dashboard.html | observe, traceload, measureflow, watchrequests |
| [testaccessibility](../tests/code/recipes/testaccessibility.json) | starter | 2100 ms | product-grid.html | readertree, readoutline, readmeta, verifyvisible |
| [testdeeplinks](../tests/code/recipes/testdeeplinks.json) | intermediate | 3300 ms | dashboard.html | observe, readlinks, readfinalurl, countpages |

### monitoring recipes

| Recipe | Difficulty | Expected duration | Fixture page | Kinds exercised | Schedule |
| --- | --- | --- | --- | --- | --- |
| [monitorpricechange](../tests/code/recipes/monitorpricechange.json) | intermediate | 3400 ms | dashboard.html | observe, readtext, watchmutate | */5 * * * * |
| [monitoravailability](../tests/code/recipes/monitoravailability.json) | starter | 2000 ms | dashboard.html | observe, verifyvisible, watchbanner | */10 * * * * |
| [monitornetworkquiet](../tests/code/recipes/monitornetworkquiet.json) | intermediate | 3800 ms | dashboard.html | observe, watchrequests, waitquiet, readerrors | */15 * * * * |
| [monitorpagechanges](../tests/code/recipes/monitorpagechanges.json) | advanced | 6100 ms | feed.html | observe, watchmutate, diffsnapshots | 0 * * * * |
| [monitorschedule](../tests/code/recipes/monitorschedule.json) | intermediate | 3600 ms | dashboard.html | observe, intervalrule, readtext, watchmutate | */5 * * * * |
| [monitoralerts](../tests/code/recipes/monitoralerts.json) | advanced | 5900 ms | dashboard.html | observe, watchconsole, watchbanner, readerrors | */2 * * * * |

### agent recipes

| Recipe | Difficulty | Expected duration | Fixture page | Kinds exercised | Topology |
| --- | --- | --- | --- | --- | --- |
| [agentswarm](../tests/code/recipes/agentswarm.json) | advanced | 7200 ms | product-grid.html | observe, parallel, readtext, countelements, exportjson | swarm |
| [agentsreview](../tests/code/recipes/agentsreview.json) | intermediate | 3500 ms | product-grid.html | observe, readtable, condition | review |
| [agentsforms](../tests/code/recipes/agentsforms.json) | advanced | 7500 ms | checkout.html | observe, parallel, fillform, submit | parallel |
| [agentsmonitor](../tests/code/recipes/agentsmonitor.json) | advanced | 6900 ms | feed.html | observe, watchmutate, parallel, readtext, readscrollpos | monitor |
| [agentscompete](../tests/code/recipes/agentscompete.json) | advanced | 7800 ms | product-grid.html | observe, parallel, readtext, scrapetable, exportjson | compete |

The five agent recipes are the certified examples of the topologies the multi agent certification covers — the swarm, the review, the parallel, the monitor and the compete scenario of `docs/agentscenarios.md`; the certification doc of `docs/agentcert.md` links them as the plan-file half of that ledger.

## The recipe format reference

A recipe is a plan document the `planlint` command parses under schemastrict, so it obeys the frozen plan grammar and nothing wider:

- `version` — the plan grammar version the document carries, currently `"2.0.0"`.
- `goal` — the plain language objective the plan proposal shows the reviewer.
- `origin` — the HTTPS origin every step of the plan binds to; the gallery allows the four local fixture hosts (`productgrid.test`, `checkout.test`, `dashboard.test`, `feed.test`) and the reserved example, invalid and loopback hosts only, so no recipe hardcodes a remote origin.
- `grants` — the action kinds the plan grants ahead of the review; the lint refuses any step whose kind sits outside the grants.
- `steps` — the reviewed step list. A step carries its `id`, its `kind` from the action kind catalog, its `label`, and its optional `target` selector, `value`, `options` (a JSON string), `gate` flag, loop `bound` and retry `attempts`. Unknown fields refuse with the path that names them.
- every step `kind` is lowercase letter only (`/^[a-z]+$/`) — the workflow step grammar rejects digits, so a kind like `a11ytree` never appears in a recipe.
- every step whose kind grades sensitive (the fill, submit, wizard, select chain, date, typeahead and export families) declares `"gate": true`, so it refuses before any run starts unless the review approves it.

```json
{
  "version": "2.0.0",
  "goal": "Scrape the product grid of the gallery fixture store",
  "origin": "https://productgrid.test",
  "grants": ["observe", "countelements", "readtext", "exportjson"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the product grid page" },
    { "id": "cards", "kind": "countelements", "label": "Count the product cards", "target": ".product-grid article" },
    { "id": "titles", "kind": "readtext", "label": "Read the product titles", "target": ".product-grid article h3" },
    { "id": "export", "kind": "exportjson", "label": "Export the grid inventory", "gate": true, "options": "{\"name\":\"product-grid-inventory\"}" }
  ]
}
```

The gallery index carries the metadata the frozen plan grammar cannot, one entry per recipe beside the fixture page declarations. Every field of an entry:

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | every entry | The unique recipe id; it must match the recipe file name of `tests/code/recipes/` (the id `scrapeproductgrid` names `scrapeproductgrid.json`) and no id may duplicate. |
| `category` | every entry | One of the five families: `scraping`, `forms`, `testing`, `monitoring` or `agents`. |
| `difficulty` | every entry | The grade `starter`, `intermediate` or `advanced`. |
| `description` | every entry | The plain language description of at least twenty characters the index shows beside the recipe. |
| `fixture` | every entry | One of the four fixture pages of `tests/code/pages/` the recipe runs against. |
| `origin` | every entry | The local HTTPS origin the recipe and its fixture page share. |
| `expecteddurationms` | every entry | The expected dry run duration in milliseconds, a positive integer the report compares against the measured one. |
| `capabilities` | every entry | The manifest permissions the entry needs beyond the base set; every name must sit inside the required or optional permission set of `manifest.json` (the agent recipes declare `tabs`). |
| `consentclasses` | every entry | The sensitive class consents the review demands before the recipe runs — `credential` for the login recipe, `payment` for the checkout recipe, empty for the other 34. |
| `kinds` | every entry | The exact action kind set the recipe exercises, including the child kinds nested in the control payloads; the gate refuses a disagreement with the recipe steps. |
| `exportformat` | scraping only | The export format the recipe's export step writes: `csv`, `json` or `excel`. |
| `schedule` | monitoring only | The five field cron schedule the monitor runs on, from the two minute alert cadence to the hourly page diff. |
| `topology` | agents only | The certified topology the recipe demonstrates: `swarm`, `review`, `parallel`, `monitor` or `compete`. |

## How to author and validate a new recipe

1. Write the plan document as `tests/code/recipes/<id>.json` in the plan grammar above: a local fixture origin, the grants that cover every step kind, a selector that resolves inside the fixture page, and `"gate": true` on every sensitive step.
2. Add the index entry to `tests/code/recipes/gallery.json` with every field of the reference table — the `id` must match the file name, the `kinds` set must equal the kinds the steps and their control payloads carry, and the category field of the family (`exportformat`, `schedule` or `topology`) must be present.
3. Run the gate: `node tests/recipes.mjs` validates the plan against the frozen schema, lints it under the portable rule set with the cli capability set, resolves every selector against the fixture page, dry runs the plan through the runflow pipeline and replays the cli planlint command over the built copy. The gate exits nonzero on any failure and writes the run report to `tests/artifacts/recipes.json`.
4. Run the vitest file: `npx vitest run tests/recipes.test.ts` verifies the artifact covers every gallery entry, that every outcome is a pass, and re-runs the source grammar pass over the recipes and the index.
5. Run the diff mode before a release: `node tests/recipes.mjs diff` compares the fresh gallery against the previous report artifact — an entry added, removed, re-categorized, re-graded or drifted in its steps or kinds fails the diff, so the gallery never drifts silently between releases.

The selectors of a new recipe must resolve against the fixture page the entry names (the gate walks every compound of every selector), and the kinds must stay inside the portable capability set the `planlint` command builds.

## The fixture pages

The four fixture pages of `tests/code/pages/` are self contained static documents — inline styles, inline scripts, no remote resource, no fetch, no storage, no cookie — each claiming its own local origin so the recipes bind to it exactly the way a live session binds to a real origin.

| Page | Origin | Features it covers |
| --- | --- | --- |
| product-grid.html | https://productgrid.test | A six card product grid, three page pagination controls, lazy loaded inline images, a price table with stock counts, a review list, a four image gallery, a filter form and a typeahead search with a live suggestion list. |
| checkout.html | https://checkout.test | A login form, a three step checkout wizard (address, shipping, review) with its hidden fieldsets, a registration form, dependent region and city dropdowns, a delivery date calendar and the inline validation errors every submit reveals. |
| dashboard.html | https://dashboard.test | A live price ticker on a 1200 ms timer, appended toasts, a deliberate console log and console error, an availability badge, three in page deep links and a network activity meter that decays toward quiet on a 900 ms timer. |
| feed.html | https://feed.test | An infinite scroll feed with its sentinel (the IntersectionObserver appends one card per arrival, capped at six), two delay timer cards, a local search results block and a three level nested comment tree. |

The build ships every page into `dist/fixtures/pages/` beside the recipes, so the packages and the container image carry the same local targets the gate validates against.

## Consent requirements per recipe class

The gallery ships the same consent posture the live surface keeps — no recipe bypasses a review:

- Every recipe runs read steps freely and gates every sensitive step: the fill, submit, wizard, select chain, date pick, typeahead pick and export kinds all grade sensitive, so every one of those steps declares `"gate": true` and waits for the approval before it executes. The dry run of the gate routes these gates to a recording provider and counts them — the report records the gate count of every entry.
- Two recipes additionally demonstrate the class consent layer: `fillloginform` fills a password field, so the classification demands the `credential` class consent; `fillcheckout` fills a card number field, so it demands the `payment` class consent. Each sensitive class needs its own fresh consent prompt per origin — an expired consent covers nothing and a consent of another class never widens.
- The gate proves the demand holds in both directions: it lints the two consent recipes once with the fresh class consent records the review flow writes (the lint passes) and once without them (the lint refuses with the diagnostic naming exactly the declared classes — `fillloginform` without its consent, the plain cli planlint refuses the built recipe copy the same way, which is the documented demonstration of the refusal).
- The other 34 recipes declare no consent class, and the gate verifies they demand none: no gallery recipe grades sensitive by default (the plain sensitive window without a named class), because the review the gallery documents always names its class.

The consent gate flow of `docs/flowdocs.md` draws the same decision tree the recipe gates cross.

## Expected export outputs of the scraping recipes

Every scraping recipe ends in an export step that grades sensitive (the export family moves data out of the page memory), so each one carries `"gate": true` and the artifact name it writes in its options:

| Recipe | Export step | Format | Artifact name |
| --- | --- | --- | --- |
| scrapeproductgrid | `exportjson` | json | product-grid-inventory |
| scrapetablepagination | `exportcsv` | csv | price-table-rows |
| scrapereviews | `exportjson` | json | review-digest |
| scrapesearchresults | `exportjson` | json | search-results |
| scrapenestedlists | `exportexcel` | excel | comment-tree-outline |
| scrapeinfinitefeed | `exportjson` | json | feed-capture |
| scrapedynamicprices | `exportcsv` | csv | price-series |
| scrapeimagegallery | `exportcsv` | csv | gallery-assets |

The index `exportformat` field of each entry must agree with the export kind its steps carry (`exportcsv`, `exportjson` or `exportexcel`), and the gate refuses a scraping entry whose declared format has no matching export step. The dry run executes the export steps without side effects; the live run writes the named artifacts through the reviewed export family after the gate approves.

## Troubleshooting per recipe family

- scraping — a selector that names a region the fixture page never carries fails before the dry run with the unresolved compounds named (for example a `.pagination` compound against `feed.html`); check the fixture features table above and the kind docs of `docs/kinddocs.md` for the option grammar of the read and export kinds. The export mismatch (`exportformat` declared while no export step carries the kind) refuses at the metadata check.
- forms — a refusal naming the consent class (`plan.consent.class`) means the review has not recorded the fresh class consent the entry declares; the login recipe needs the credential class and the checkout recipe the payment class on their origin. A sensitive step without its gate flag refuses before any run starts — the fill, submit, wizard, select chain, date and typeahead steps all need `"gate": true`.
- testing — the watch and capture kinds need their reviewed options (the two snapshot versions of `diffsnapshots`, the console and error sources of the dashboard fixture); the console recipes read the deliberate one log and one error line the dashboard fixture writes on load.
- monitoring — the schedule must be a five field cron expression (minute, hour, day of month, month, day of week); a six field expression or a named schedule refuses at the metadata check. The watch kinds bind to the mutating regions of the dashboard and feed fixtures (the price ticker, the toast list, the network meter).
- agents — every agent entry must declare one of the five certified topologies, and the `parallel` options must carry the branches with their join strategy (`first`, `last` and the failure policies) the compose engine grades; the agent recipes also declare the `tabs` capability, so a manifest without the optional tabs permission fails the capability check.

## The recipes run in ci

The verify lane runs `node tests/recipes.mjs` after the build, so every release candidate validates the whole gallery against the compiled bundles it is about to ship: the schema validation, the lint, the consent proofs, the fixture resolution, the dry runs and the cli import cells all re-run on every push. The vitest file of `tests/recipes.test.ts` verifies the recorded artifact covers every gallery entry with passing outcomes, and the diff mode refuses a silent gallery drift between releases — the example set is standing release evidence, not a snapshot.
