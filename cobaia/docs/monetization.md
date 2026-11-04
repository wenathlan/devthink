# cobaia monetization surface

cobaia is the public monetization surface of the devthink family: the content site that carries the mrr plan table, the support channels and the honest advertisement slots while the ten family applications stay clean.

## overview

- a plain content site with no entry gate and no onboarding flow: every page is public and the home renders directly on the bare root
- one window shell (header, footer) wraps every content route; the intro page mounts bare at /intro outside the chrome
- every plan href and support href ships empty until the owner configures billing; the interface renders honest empty states instead of dead links
- no ad network script is committed: the loader enters only after network approval, injected through the deploy environment
- zero tracking: no cookies, no local storage, no analytics beacons, no keys committed
- build tooling: vite static build, wouter router on the declared vite base, vitest suites, biome formatting

## module inventory

the pure logics at the app root, each one a typed accessor over the content lane:

- adsconfig.ts: the honest ad slot registry. exports the adsslot type (slotid, format, ratio), the fixed label advertisement, the empty note ad slot not configured yet, the reserved slots per page (home display 728/90, apps in-feed 3/1, blog in-article 3/1) and the readers adsslotfor and adsslotlive
- checkoutlinks.ts: the typed billing accessor. checkoutlinks answers the plan table, supportlinks the support channel record, isconfigured tests an href, planbyid finds one plan by id (free, pro, studio). only billing values ride here; the plan prose answers from the label store
- content.ts: the content law. section 1 holds the manifest seed (seedPosts, seedRoster, seedPlans, seedSupportLinks, seedAdsSlots, seedAdsLabel, seedAdsEmpty); section 2 holds the live loader (loadcontent over GET /api/v1/ui/content), the accessors contenttable and contentvalue (live rows first, seed fallback) and the useContent mount hook
- posts.ts: the blog accessor. posts answers the post table, postindex sorts it newest first, postwords counts the honest word total of one body
- roster.ts: the family directory accessor. roster answers the ten deploy units with slug, accent and one-line role, in rail order with the os first
- db.ts: the self-hosted sqlite runtime (better-sqlite3 through the vault storagelane). keeps the onboarding_states and labels tables with prepared, parameterized statements only
- familyurl.ts: the family address book. familyurl resolves one sibling deploy unit to the relative url ../slug/ with the trailing slash, so the family links both ways
- labels.ts: the copy law. the english manifest (LABEL_MANIFEST, revision 4) carries every interface string keyed by page.widget.key; label and labelfill read it; seedLabels mirrors the rows into the browser label store
- sandboxmodality.ts: the workload lane declaration. mirrors the three lanes cobaia owns in the family catalog (plan-checkout, ads-slot, label-seed) and reads the COBAIA_SANDBOX_LANE seat (local, join, or a pinned modality id)
- capacitor.config.ts, vite.config.ts, vitest.config.ts: the mobile conversion config, the static build and the test runner configs at the app root

## data layer

- the sqlite runtime opens one storage lane on the app-owned file cobaia.db (wal, foreign keys, patient locks) through openStorageLane of @wenathlan/vault
- every statement is prepared and bound; no sql is assembled by string concatenation
- the boot ddl is idempotent and mirrors schema.prisma, the documentation of record: the tables exist after the first open
- onboarding_states holds the entry-flow flags per visitor (introseen, onboardingseen) with a seen-wins upsert; the platform gateway serves the same flags over /api/v1/onboarding
- labels holds the interface copy store: id, text, revision, translated. the boot seed ingests the english manifest and never overwrites a translated row
- the content rows (posts, roster, plans, supportlinks, ads.slots, ads.label, ads.empty) live in the site store and answer over the platform gateway at GET /api/v1/ui/content; the manifest seed in content.ts is the fallback the offline static build reads
- the browser never imports db.ts: better-sqlite3 cannot ride the static bundle, so the browser pulls the live rows over the internal api (base from VITE_CATALOG_URL, 4 second abort window, one load per session)
- the vitest suites (adsconfig, checkoutlinks, familyurl, posts, sandboxmodality) pin the module contracts: the slot registry, the placeholder prices, the empty hrefs and the plan prose keys

## sol subapps

the theme surface, one folder per page, mounted by the theme anchor sol/Sol.tsx on wouter:

- home: the landing. left-aligned hero, the three steps (engine, static, honest), a four-card directory preview reading the one roster table (devthink, saddle, vault, cadria), the support strip and the reserved ad slot at the end of the content
- apps: the directory. one card per deploy unit with the honest role and the deep link through familyurl, closed by the in-feed ad slot
- pricing: the plan table. three honest plans (free, pro, studio), a configured href renders a live anchor, an empty one the disabled button plus the note checkout not configured yet, and the money section explains the us$15 a month floor. no ad slot on this page
- support: the support channels. github sponsors and ko-fi cards with the same configured-or-honest rule, the other ways to help section and the invalid traffic line. no ad slot on this page
- blog: the update blog. the sorted index and the full bodies of the posts as real articles with date, word count and tags in the meta line, closed by the in-article ad slot
- legal: the privacy policy and the terms. discloses the advertising plan (labeled reserved slots, third-party cookies only once a network is live) and the analytics rule (none by default). no ad slot on this page
- intro: the bare presentation page. the akash splash (plays per visit, writes nothing, skips on click, tap or key), the plans zone reading the one checkoutlinks table, the door panes and the footer doors
- notfound: the 404 answer inside the site chrome
- shell: the one chrome. the sticky acrylic nav with the active section indicator, the footer carrying the family row through familyurl, and the embedded contract that renders the same surface inside the devthink os power clip
- wingets: the shared components (IntroSplash, IntroPlans, IntroFooter, ShellAdsslot, ShellBrand) re-exported through one index surface

## family integration

- the roster mirrors the ten deploy units: devthink the os, saddle the sandbox, forge the execution clone, foundry the complete clone, vault the storage clone, getry the ai workspace, cadria the video and image studio, debonair the audio daw, stealthhead the fps game platform, argan the dns toolkit, each with its spec section 12 accent
- familyurl resolves every sibling one level above this deploy unit, so the directory links out and every sibling footer links back
- the label store rides the shared vault labelstore; the sqlite lane rides the shared vault storagelane, the same mechanism the storage clone keeps
- the deploy targets are static: netlify, vercel and cloudflare workers configs sit at the app root beside robots.txt and sitemap.xml; the capacitor mobile lane renders the same web bundle
- the package identity is @wenathlan/cobaia inside the devthink monorepo; the devthink.toml declares the app role and the seven pages (home, pricing, support, apps, legal, blog, notfound)
