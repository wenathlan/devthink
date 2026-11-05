# cobaia features

the real feature list of the cobaia content site, extracted from the code: every item below exists in the app root logics or the Sol theme.

## plans

- three mrr plans: free at us$0, pro at us$5 and studio at us$19 per month, placeholder prices until the billing platform decision lands (stripe payment links or paddle)
- honest checkout state: a configured plan href renders a live anchor, an empty one renders the disabled button with the note checkout not configured yet
- plan lookup: planbyid answers one plan of the table by its stable id (free, pro, studio)
- plan prose in the label store: every plan sentence (name, billing period, blurb, features) answers from labels.ts; only the billing values ride checkoutlinks.ts
- intro plans zone: the intro page renders the same offer from the one checkoutlinks table, the studio plan leading raised
- what the money covers: the pricing section states the us$15 a month floor of domains and free static hosting and that the applications stay ad free
- billing webhook walk lane: the plan-checkout workload lane is declared in sandboxmodality.ts for the billing webhook work when it lands, secrets server side

## ads

- reserved slot registry: one slot per content page, home display at 728/90, apps in-feed at 3/1, blog in-article at 3/1, keyed by page folder name
- honest ad container: a fixed aspect-ratio box on a hairline well, visibly labeled advertisement, rendering the empty note ad slot not configured yet while no slot id is set, so the page never shifts when a real unit arrives
- script rule: no ad network script lives in the repository; the adsense or equivalent loader is injected after network approval through the deploy environment only
- slot liveness check: adsslotlive answers whether a reserved slot carries a real network id
- ad free surfaces: the pricing, support and legal pages carry no ad slot; nothing that asks for money or discloses policy sits beside an advertisement
- ads slot lane: the ads-slot workload lane is declared for the reserved slots and the rotation decision the deploy answers before the render

## content

- content lane: the pages read the live rows the platform gateway serves over GET /api/v1/ui/content and fall back to the manifest seed in content.ts, so the interface never blanks
- content kinds: the lane serves posts, roster, plans, supportlinks, ads.slots, ads.label and ads.empty, each row an ordinal and a json payload
- live load discipline: one fetch per session against the configured base (VITE_CATALOG_URL) with a 4 second abort window; any failure keeps the seed answering
- useContent mount hook: a store-riding page loads the live rows once per mount and re-renders when they land, with no first-paint flash
- update blog: three seed posts with full bodies (ten sites one engine, one css one tree, no backend no tracking), the index sorted newest first and each post carrying date, tags, excerpt, body and the honest word count
- app directory: the ten deploy units of the family, each card carrying the one-line role declared in its own devthink.toml and its spec accent
- label store: every interface string rides the label manifest at revision 4, read through the typed accessors label and labelfill, seeded into the store with translated rows protected from overwrite
- label seed lane: the label-seed workload lane is declared for the manifest walk the sqlite vault carries

## support

- two support channels: github sponsors and ko-fi, both presented as zero platform fee, read from the supportlinks record
- honest channel state: an unconfigured channel renders the disabled button with the note link not configured yet, never a fake link
- other ways to help: the section lists the public issue tracker, writing about the tools and linking the directory
- invalid traffic policy: the site states no ad clicking, no traffic exchange, no bots, because automated traffic against an ad surface kills the ad account and the domain reputation
- support strip on home: the landing carries the support call before the reserved ad slot

## ui

- one shared shell: the sticky acrylic nav with the active section indicator and the worked footer carrying the family row, the same surface at the direct url and inside the os power clip
- routes: home on the bare root, apps, pricing, support, blog, legal inside the shell, the bare intro at /intro and the catch-all 404
- intro splash: the akash opening with the mark spring, name rise and role fade, skippable by click, tap or key, honoring reduced motion and writing nothing to the visitor machine
- brand mark: the drawn beaker svg in the dark amber gradient, the only seat of the identity accent, with a gentle hover tilt
- home landing: left-aligned hero, the three steps (engine, static, honest), the four-card featured directory preview and the support strip
- legal page: the privacy policy and terms with clause leads, disclosing the advertising plan and the analytics rule
- notfound page: the 404 answer inside the site chrome with the way out to home and the directory
- window captions: the shell carries the minimize, maximize and close caption labels for the os window seat
- wouter routing on the declared vite base: deep links resolve against the pages subpath the build declaration owns
- static deploys: netlify, vercel and cloudflare workers configs at the app root, plus robots.txt and sitemap.xml for the crawlers

## Dependencies

- synchronized dependency union — the eleven family apps share one dependency tree: identical `dependencies`, `devDependencies` and `peerDependencies` (same keys, same versions, nothing removed, highest semver wins on conflicts) and one `engines` catalog with node as maestro and the V 0.5.2 seat as catalog annotation (@family wave/depssync).
