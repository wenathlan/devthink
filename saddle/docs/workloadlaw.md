# the workload law — the family lane catalog and the join of record

> wave WL1 — the answer to the owner's charge: the system and every step
> of it ride the saddle, the visitor browser, gpu, cpu and storage are
> never touched, and the ninety modality modalities of the engine answer
> the family's work over the internet.

## the law

The engine already carried the nuclear modality law since wave SV1
(`modalityregistry.ts`): the workload never chooses a modality by name —
the join resolver reads the demand (isolation, gpu, network, boot budget)
and answers the modality set that satisfies it, so the person chooses
none and the platform resolves the join of all. Until this wave the law
was a declared spine without a caller: the registry was a catalog and a
report, no lane of any app ever asked the join a question, and the
debonair worker seat named modality ids by hand without a resolver behind
them.

The workload law (`workloadlaw.ts`) makes the nuclear law executable for
the whole family:

1. **The catalog** — `FAMILYLANES` carries one row per heavy workload
   lane of every official app of the monorepo: the app that owns the
   lane, the lane id, the role sentence, the demand (gpu, network,
   isolation depth, boot budget) and the honest today (`engine-lane` when
   the heavy pass already runs on a server-side engine surface,
   `app-lane` when it still walks inside the app surface). The analysis
   wave (A1) mapped all thirty-six lanes from the real modules of the
   eleven apps.
2. **The join** — `lanejoin` rides the registry's `resolvejoin` for each
   row's demand and answers the ordered candidate set with the honest
   verdict: `dispatchable` (at least one live modality satisfies the
   demand), `planned-only` (only planned records answer — the gpu lanes
   ride here today and say so) or `unresolved` (a calibration defect the
   battery refuses).
3. **The census** — `workloadreport` folds the per-app joins into the
   family work order: the dispatchable count, the planned-only wait, the
   app-lane migration list (the lanes whose heavy pass still walks the
   app surface — the next waves' honest backlog), nothing hardcoded.

Every row carries a demand and never a modality id — the candidates are
computed from the registry of record, so a modality that turns live
tomorrow answers the same lane without this file moving.

## the family mirrors

Each app of the family carries `sandboxmodality.ts` — the mirror of its
own rows in the engine catalog, plus the deploy's opt-in seat:

- `WORKLOADLANES` — the mirrored lane rows (the lockstep string contract:
  mirrored, not imported, because the published saddle envelope does not
  carry the workload law yet and the family law bars relative paths
  across apps — the same discipline the devthink modalities vendor
  rides).
- `<APP>_SANDBOX_LANE` — the deploy's seat: `local` (the default, the
  deploy's own process), `join` (the platform resolves every lane through
  the engine's join resolver), or a pinned modality id (named by the
  deploy, validated by the platform's join at dispatch — the app module
  never judges engine vocabulary, so the mirror cannot drift when the
  registry grows).
- The debonair keeps its worker seat (`DEBONAIR_WORKER_MODALITY`) beside
  the family seat — the two coexist honestly: the worker seat pins the
  worker process, the lane seat declares the lanes to the platform.

Every app battery pins its mirror against the engine catalog through the
vitest bridge (`@wenathlan/saddle/workloadlaw` → the monorepo source),
comparing lane, role, demand and today row by row — the vendor can never
drift in silence. The bridge retires when the published envelope carries
the built workload law.

## the api surface

The self-hosted web console (`webserver.ts`) answers the law over the
`/api/v1` contract:

- `GET /edge/workloads` — the family census: the workload report, the
  probed lane table of the edge plane and the app list, one round trip.
- `GET /edge/join?app=&lane=` — the nuclear law as a lookup: the workload
  names its app and lane, the resolver answers the ordered candidate set
  with the honest verdict. A 404 answers an unknown app or lane (the
  honest refusal, never a silent empty join).

## the honest first census

The first reading of the law over the current registry (30 live, 3 host,
57 planned modalities):

- thirty-five of the thirty-six lanes resolve dispatchable — at least
  one live modality satisfies every demand except the gpu wait;
- `stealthhead/world-bake` answers planned-only — every gpu record of the
  registry is planned today, and the lane says so instead of pretending
  (the first gpu modality that turns live answers it without any file
  moving);
- sixteen lanes still walk the app surface (`app-lane`) — the seeded
  rehearsals of forge and foundry, the browser fallbacks of argan's
  catalog, the decode lane of cadria, the simulation walks of
  stealthhead: the honest migration list the next waves work through,
  lane by lane, each one a deploy that seats `join` and a platform that
  dispatches through the edge plane.

The lane table, the join and the census are the wiring truth of this
law: a lane that does not ride the saddle says so, a lane that can ride
tomorrow is named, and nothing pretends.
