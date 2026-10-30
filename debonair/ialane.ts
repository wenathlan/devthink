// # ialane — the system ia ingest lane (root layer, wave PV1.009): the
// reference library grows without a human — the ia (or an mcp automation,
// opt-in) posts the same upload route the visitor bench rides, with the
// service identity as the owner stamp and the reference kind, so the
// library shelves fill beside the human uploads under the same law. the
// lane is one pure function the family wave's mcp automation drives:
// postReference never throws, answers the client's own typed codes, and
// validates the genre against the style dictionary before any byte leaves
// the host (the fifteen keys the pattern miner groups by — a genre off
// the dictionary answers bad-request and never fetches). the service
// identity rides the caller's serviceId when the automation carries its
// own (the mcp law: an external agent ingests with its own identity);
// absent one, the lane's process identity answers — minted once per
// process, the same seat law the owner stamp rides. the references land
// vitrine (the visibility law the pattern miner and the composer read
// the public shelf through). zero dependencies, zero consumer data.

import { mintid } from "./bigintids.ts";
import { GENRES } from "./genrematrix.ts";
import type { IngestClientDeps, IngestClientResult } from "./ingestclient.ts";
import { uploadIngest } from "./ingestclient.ts";

/** @section identity — the service seat */

/** The process-stable service identity — the owner stamp the lane's own
 * posts carry when the caller brings none (minted once per process, the
 * same time-ordered decimal form every row stamp rides). */
const SERVICE_ID = mintid();

/**
 * The service identity of this lane process (the mcp automation reads it
 * to keep its own identity apart; a deploy pins it through serviceId).
 *
 * @returns the service id in the minted decimal form.
 */
export function servicelaneid(): string {
  return SERVICE_ID;
}

/** @section genre — the style dictionary law */

/** The genre keys the lane accepts (the style dictionary ids — the same
 * fifteen the pattern miner's profile keys group by). */
const GENRE_KEYS: readonly string[] = GENRES.map((genre) => genre.id);

/** @section post — the one door the automation drives */

/** The post the lane drives: the source bytes, the display name, the
 * genre key the library groups by, the gateway origin and the service
 * identity (the caller's own when the automation carries one). */
export interface ReferencePostInput {
  /** The source wav bytes (the worker decodes them at the run). */
  bytes: Uint8Array;
  /** The display name of the source (the worker folds the extension). */
  name: string;
  /** The genre key — one of the style dictionary's fifteen. */
  genre: string;
  /** The gateway origin (https, a public host). */
  origin: string;
  /** The service identity the owner stamp carries (defaults to this
   * lane's process identity). */
  serviceId?: string;
  /** The injected seams (the tests hand doubles). */
  deps?: IngestClientDeps;
}

/** The record the lane answers — the job the gateway queued, the genre
 * the library groups by, the name and the service identity that stamped
 * it (the pointer chain the mcp driver files when the walk lands). */
export interface ReferenceRecord {
  /** The job id the upload route minted (poll it for the walk). */
  jobId: string;
  /** The genre key of the source (the grouping law). */
  genre: string;
  /** The display name of the source. */
  name: string;
  /** The service identity that stamped the row (the owner). */
  serviceId: string;
  /** The ingest kind — always a reference on this lane. */
  kind: "reference";
  /** The visibility — always the vitrine on this lane. */
  visibility: "vitrine";
}

/**
 * Posts one reference through the same upload route the bench rides: the
 * service identity stamps the owner column, the kind is "reference" and
 * the visibility is "vitrine" (the public shelf the pattern miner reads).
 * the genre is validated against the style dictionary first — a genre off
 * the fifteen answers bad-request and never leaves the host. never a
 * throw: the refusal answers the client's own typed codes.
 *
 * @param input the post facts.
 * @returns the reference record (the job to poll), or the typed err.
 */
export async function postReference(input: ReferencePostInput): Promise<IngestClientResult<ReferenceRecord>> {
  if (!GENRE_KEYS.includes(input.genre)) {
    return {
      ok: false,
      error: {
        code: "bad-request",
        message: `the genre ${JSON.stringify(input.genre)} is off the style dictionary — the lane carries one of the fifteen`,
        status: null,
      },
    };
  }
  const serviceId = input.serviceId ?? SERVICE_ID;
  const answer = await uploadIngest(
    {
      bytes: input.bytes,
      name: input.name,
      ownerId: serviceId,
      kind: "reference",
      visibility: "vitrine",
      origin: input.origin,
    },
    input.deps,
  );
  if (!answer.ok) return answer;
  return {
    ok: true,
    data: {
      jobId: answer.data.jobId,
      genre: input.genre,
      name: input.name,
      serviceId,
      kind: "reference",
      visibility: "vitrine",
    },
  };
}
