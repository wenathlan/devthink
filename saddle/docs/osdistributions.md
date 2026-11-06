# os.distributions — the sixteen system seats the saddle container carries

> the owner order (pr15, verbatim): "iniciar distribuição do container
> saddle com por exemplo, grapheneos, omarchy e outros sistemas dentro do
> saddle" — the saddle container starts its distribution catalog with
> grapheneos, omarchy and the other systems inside the saddle. and:
> "saddle também vira com outras distribuições de sistema operacional
> além de linux como por exemplo, maru os is firmware not an application
> / vanilla os is based on ubuntu / v / omarchy is arch linux-based
> distribution created by dhh / grapheneos is a privacy and security
> hardened version of android / linux normal / max / lite / balanced /
> android / arm64 / amd64 / vgpu / vcpu / por exemplo, 50gb por plano
> via config." and the more-than-fifteen directive: "o saddle nao ta
> com mais de 15 devido as disvbriçoe s com sistem aoperacional como
> graphene os e etc" — the saddle container carries more than fifteen
> system seats.

## the registry

`saddle/containerarch.ts` — the file that already owned the
eleven-architecture standard and the build architecture table — now
carries the os distribution catalog beside them (section 1c of the
file): one honest row per system seat, pure data and pure functions,
frozen at module load, zero storage, zero node-only imports (the one
import it takes — `engineplans.ts` — is itself pure data).

| seat | kind | base (the true fact) | package | arch pairing | legs | tiers |
| --- | --- | --- | --- | --- | --- | --- |
| grapheneos | mobile | android | apk | linux-arm64, darwin-arm64-v8 | arm64 | max/balanced/lite |
| omarchy | desktop | arch linux | pacman | linux-x64, linux-x64-musl, linux-arm64 | amd64+arm64 | max/balanced/lite |
| vanillaos | distribution | ubuntu | apt | linux-x64, linux-x64-musl, linux-arm64 | amd64+arm64 | max/balanced/lite |
| maruos | firmware | android firmware with a debian desktop | abuild | linux-arm64, darwin-arm64-v8 | arm64 | max/balanced/lite |
| v | languageos | the v language platform (vlang, the 0.5.2 catalog seat) | vpm | linux-x64, linux-arm64, darwin-arm64, darwin-x64, windows-x64, wasm32 | amd64+arm64 | max/balanced/lite |
| linux | distribution | the plain linux baseline the engine container rides | apt | linux-x64, linux-x64-musl, linux-arm64, linux-riscv64 | amd64+arm64+riscv64 | max/balanced/lite |
| android | mobile | the android application platform | apk | linux-arm64, darwin-arm64-v8 | arm64 | max/balanced/lite |
| postmarketos | mobile | alpine linux | apk | linux-arm64, darwin-arm64-v8 | arm64 | max/balanced/lite |
| lineageos | mobile | android | apk | linux-arm64, darwin-arm64-v8 | arm64 | max/balanced/lite |
| calyxos | mobile | android | apk | linux-arm64, darwin-arm64-v8 | arm64 | max/balanced/lite |
| archlinux | desktop | arch linux | pacman | linux-x64, linux-arm64 | amd64+arm64 | max/balanced/lite |
| alpine | distribution | musl libc busybox | apk | linux-x64, linux-arm64, linux-x64-musl, linux-riscv64 | amd64+arm64+riscv64 | max/balanced/lite |
| debian | desktop | the debian project | apt | linux-x64, linux-arm64 | amd64+arm64 | max/balanced/lite |
| fedora | desktop | red hat linux upstream | rpm | linux-x64, linux-arm64 | amd64+arm64 | max/balanced/lite |
| nixos | distribution | the nix package manager | nix | linux-x64, linux-arm64 | amd64+arm64 | max/balanced/lite |
| void | distribution | xbps | xbps | linux-x64, linux-arm64, linux-x64-musl | amd64+arm64 | max/balanced/lite |

the seven named law seats ride first (the order the owner's sentence
rides them), then the nine honest additions the more-than-fifteen
directive rides: postmarketos, lineageos, calyxos, archlinux, alpine,
debian, fedora, nixos and void — every one a real distribution with
its true upstream fact.

the true facts the owner's law pins, verbatim in the rows' notes:

- **grapheneos** is a privacy and security hardened version of android
  (the hardened mobile seat, the apk grammar, the arm64 legs).
- **omarchy** is the arch linux-based distribution created by dhh (the
  desktop seat, the pacman grammar, the amd64 and arm64 legs).
- **vanilla os** is based on ubuntu (the atomic desktop seat beside the
  plain linux baseline).
- **maru os** is firmware, not an application (the catalog carries the
  seat honestly, the engine never installs it as a guest application —
  it rides no vgpu path).
- **v** names the v language platform the dependency catalog pins at
  0.5.2 (`package.json` carries `"v": "^0.5.2"`), never a guest
  distribution — the languagev compiler seat of the ninety modalities
  answers it (the owner's nickname law, the same law
  `docs/ninetymodalities.md` records).
- **linux** is the normal baseline: the default distribution the saddle
  container itself rides (the resolver's default), every linux seat the
  standard carries answers it.
- **android** is the mobile platform the grapheneos hardening builds on.

the true facts of the nine additions, verbatim in the rows' notes:

- **postmarketos** is the alpine-based mobile distribution real devices
  boot (the community mobile seat, the apk grammar, the arm64 legs).
- **lineageos** is the community android continuation (the aftermarket
  mobile seat on the arm64 legs).
- **calyxos** is the privacy-focused android distribution (the hardened
  mobile seat beside grapheneos).
- **archlinux** is the rolling-release distribution omarchy builds on
  (the pacman desktop seat on the amd64 and arm64 legs).
- **alpine** is the musl-based lightweight distribution (the
  small-footprint seat the musl legs answer).
- **debian** is the universal operating system (the apt desktop seat the
  widest hardware matrix answers).
- **fedora** is the red-hat-upstream community distribution (the rpm
  desktop seat beside the apt rows).
- **nixos** is the declarative distribution the nix package manager
  builds (the reproducible-system seat).
- **void** is the independent source-rolling distribution (the xbps seat
  the musl legs answer beside alpine).

## the pairings (real joins, never duplicated lists)

- the **arch pairing**: every `archs` entry of every row is a real seat
  id of the eleven-architecture standard (`CONTAINERARCHIDS` — the
  tests assert it, never an invented seat id). the legs column is not
  stored data: `osdistributiondockerarchs(id)` derives the amd64/arm64
  docker legs by joining the row's pairings against the carried seats
  of `CONTAINERARCHES` (the target seats the v row pairs contribute no
  leg — the binary and npm lanes own them).
- the **tier binding**: every seat binds the full max/balanced/lite
  engine plan trio, and the trio itself is derived from
  `ENGINEPLANS.map((row) => row.id)` — the ids stay the engineplans
  table's own, never a duplicated tier list. the tier axis scales the
  virtual hardware plan, never the catalog: the tier and the seat stay
  orthogonal, exactly like the sandbox bases (`SANDBOXBASES`) stay
  orthogonal to the guest os ids.
- the **virtual device law** (vgpu/vcpu): `vgpu` and `vcpu` are law
  fields, not caps — vgpu marks the seats that present a virtual gpu
  path (false for the firmware seat and the language seat), vcpu pins
  that every seat rides the engine's virtual cpu bank. the counts
  arrive from the engine plan profile, never from the catalog.

## the plan-resource law (config, never a cap)

the owner's law: "por exemplo, 50gb por plano via config". the
`OSDISTRIBUTIONPLANLAW` row carries it as data:

- `examplestoragegb: 50` — the example per-plan storage quota, plan
  config data a plan row stamps;
- `quotaowner: "devthink"` — the devthink system plan logic owns every
  quota;
- `enginelimits: ENGINELIMITS` — the engineplans limits law rides the
  row verbatim (the reuse law): unlimited workloads, unlimited
  sessions, unlimited modalities, unlimited artifacts.

no row of the catalog carries a numeric resource field — the tests scan
every field of every row and fail on any number. the 50 gb is plan
config, the engine is unlimited, and the catalog never bakes a ceiling
(an engine limit would be a product decision wearing an engine costume
— the same law `docs/planningengine.md` and `engineplans.ts` record).

## the consumable surface (what the container and the modality system read)

`containerarch.ts` exports the catalog the same way it exports the
arch standard:

- `OSDISTRIBUTIONIDS`, `OSDISTRIBUTIONS`, `OSDISTRIBUTIONCOUNT` — the
  catalog rows (the publish matrix and the modality seats read the ids);
- `OSDISTRIBUTIONPROFILEIDS` — the derived engine plan trio (the tier
  binding);
- `OSDISTRIBUTIONPLANLAW` — the plan-resource law of record;
- `getosdistribution`, `resolveosdistribution`, `osdistributionerror`
  — the resolver (undefined/null answers the linux row, a known id
  answers its row, anything else throws the coded
  `OS_DISTRIBUTION_UNKNOWN` refusal naming the sixteen seats);
- `osdistributionsforarch`, `osdistributionsforprofile` — the joins the
  modality system reads (which seats ride one arch seat; which seats
  ride one tier — an unknown tier throws
  `OS_DISTRIBUTION_PROFILE_UNKNOWN`);
- `osdistributiondockerarchs` — the derived docker legs (amd64, arm64,
  riscv64) the container matrix reads;
- `osdistributioncoverage`, `osdistributionlines` — the honest coverage
  report and the rendered table lines the container lanes stamp on
  every profile run.

## the build wiring (why no new build legs)

the distribution seats ride the arch axis the pinned base already
resolves: the mobile and firmware seats ride the arm64 legs, the
desktop and baseline seats ride the amd64 and arm64 legs — the same
legs the eleven-architecture standard carries. the dockerfile documents
the law (the `THE OS DISTRIBUTION SEATS` paragraph) and the publish
lanes stay untouched: no per-os build matrix exists or is needed, the
container itself keeps riding the normal linux baseline (the container
lane law) and the sixteen seats are the catalog the modality system hosts
inside the engine, never host distributions the container installs.

## the visitor law (the critical law)

every system seat of the catalog is a hosted GUEST the engine drives on
its own twenty-four hour internet infrastructure — the catalog never
describes the visitor machine (no visitor gpu, no visitor cpu, no
visitor browser, no visitor local storage, no localforage). the engine
owns every cycle it spends through saddle and vault edge processing.

## the pinning battery

`saddle/test/osdistrib.test.ts` (nine tests, green): the sixteen seats
in law order (the seven named seats plus the nine honest additions,
more than fifteen), the true facts verbatim per named seat and per
addition seat, the arch pairing honesty (every
pairing a real seat of the standard, the derived legs per seat), the
tier binding reused from engineplans (the deep-equality against
`ENGINEPLANS.map`), the plan-resource law (50 as plan config, the
engine unlimited, zero numeric fields in the rows), the resolver (the
linux default, the coded refusals), the arch and profile joins, and the
coverage report plus the rendered lines.
