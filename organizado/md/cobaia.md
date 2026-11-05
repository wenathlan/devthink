# cobaia

## Objective

Cobaia is the public monetization surface of the family: the content site that carries the MRR plans, the support rails and the honest advertisement slots while the family apps stay clean. The OS imports it for plans, quotas and billing surfaces; the name is provisional until the owner picks the official one.

## Features

- Pricing page — the plan table with three placeholder tiers (free, mid and top monthly prices) rendered as pricing cards with billing period, blurb and feature lines from the label store.
- Checkout links — a typed billing accessor answers the plan table and the support channels; payment hrefs are configuration pinned by the owner once billing goes live, and until then every href ships empty with the honest "checkout not configured yet" state.
- Support rails — the support page answers the support channel rows (GitHub Sponsors and Ko-fi among them) the visitor may follow.
- Honest ad slots — one reserved ad container per content page (home, the app directory, the blog index), always at the end of the content, always labeled "advertisement", always a fixed aspect ratio so the page never shifts; slot ids stay empty until the network approves the site.
- Ad script law — no ad network script lives in the repository; the loader is injected after approval through the deploy environment only; no click encouragement and no automated traffic ever touch an ad surface.
- Blog — the blog index and full post bodies carry real written content about how the family is built, sorted by date with honest word counts.
- Apps directory — the family roster with every deploy unit beside itself, one accent each and the honest one-line role each app declares.
- Legal page — the legal surface of the site.
- CLI — a local inspection entry point ships with the package.
- Content law — every content row the pages render rides the site database, served by the platform gateway; the typed accessors fall back to the manifest seed so the interface never blanks.

## Monetization

- MRR plans — the plan cards read their prose through the label store while the billing lane keeps only ids, prices and links.
- Honest empty states — unconfigured checkout and ad surfaces render explicit not-configured notes instead of pretending.
- Anti-invalid-traffic law — the reserved slots never encourage clicks and never generate traffic, protecting both the ad account and the domain reputation.
- Placeholder prices — the monthly prices stay placeholders until the billing platform decision lands; no key is committed, no script is loaded.
- Content-first doctrine — the site earns its ad slots by being useful on its own merits, since networks approve content, not containers.

## Interactions

- Route tree — intro, home, apps, blog, pricing, support, legal and the 404 page.
- Intro suite — splash, plans zone and footer frames hand the visitor to the shell.
- Shell widgets — the ad slot widget renders the reserved container with its label and honest empty note; the brand widget carries the mark.
- Footer directory — the shell footer links the family roster through the relative sibling contract.

## Data

- Content rows table seeded from the manifest at boot; the browser pulls live rows over the internal content endpoint and never imports the database driver; the seed answers the offline static build.
- Onboarding flags and label rows ride the shared persistence law of the family.

## Engine role

Monetization engine seat of the family: the OS imports it for plans, quotas and billing surfaces so the product apps never carry a price or an ad.

Padrão: seguir o padrão moderno.
