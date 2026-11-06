# argan — the dossier

The network and DNS gateway library of the family. Argan owns every network logic: zones, records, dnssec, handshake, resolvers.

## Identity

- Category: network library / DNS gateway.
- Competitor space: Cloudflare DNS, AWS Route 53.
- Consumer law: the family imports argan as a library; no sibling repeats a network logic argan owns.

## Objective

Give the family one honest network engine: every DNS query, every record walk and every gateway handshake resolves through argan — never duplicated inside another app.

## Features

- DNS zone management: create, walk and validate zones and records.
- DNSSEC signing chain and validation seats.
- Gateway handshake logic for the provider family.
- Clean URL normalization and network seam helpers.
- DNS-over-HTTPS wire composition (RFC 8484) consumed by the family via library import.
- Resolver catalog and network policy seats.

## Interactions

- Library surface consumed by devthink, getry and vault (the network seam).
- CLI console with the family chat design (same face, terminal seat).

## Doctrine

- One engine, one owner: network logic lives here alone.
- English professional surface, minimalist text, title and description only.
