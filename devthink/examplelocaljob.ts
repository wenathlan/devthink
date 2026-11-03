/**
 * examplelocaljob — the local example shows that the saddle engine library
 * runs without a remote service.
 *
 * The example moved here from the saddle app root (wave 2 regrouping): it
 * is a consumer of the saddle library, not engine logic, and the family
 * rule keeps the saddle exclusively the virtualization engine while the
 * apps consume it through the published envelope. The imports follow the
 * same published-library specifier pattern the sandbox lane uses
 * ("@wenathlan/saddle/…" — see sandboxlane.ts): the engine answers from
 * the installed @wenathlan/saddle package, so the example runs in Node
 * (never in the browser) exactly the way the app runtime consumes the
 * engine. The former saddle-root example imported "../index.ts" and
 * "../virtual.ts" (broken sibling paths after the app split); this copy
 * consumes the engine the way every devthink module does.
 *
 * Run it offline with:
 *   cd devthink && node --import tsx ./examplelocaljob.ts
 *
 * The job needs no network: the storage rides a temporary directory, the
 * memory rides the in-process local memory manager and the scheduler runs
 * the in-process runner.
 */
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { engine, eventbus, inprocess, scheduler } from "@wenathlan/saddle";
import { localmemory, localstorage } from "@wenathlan/saddle/memory";

const root = await mkdtemp(join(tmpdir(), "saddleexample"));
const events = eventbus();
const run = engine({ storage: localstorage(root), memory: localmemory(), scheduler: scheduler([inprocess()]), events });
const result = await run.run({ name: "localexample", input: { source: "example" }, outputkey: "results/example.json" }, ({ job }: { job: { id: string } }) => ({ jobid: job.id, ok: true }));
console.log({ jobid: result.job.id, artifact: result.artifact.key, eventcount: events.all().length });
