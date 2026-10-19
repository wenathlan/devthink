// # bigintids — the id mint of the platform (root layer): every row the
// system writes carries a time-ordered 64-bit pointer (the big pointers the
// house storage law names), minted here. The shape packs the epoch
// milliseconds in the high bits and a counter/entropy tail in the low bits,
// so ids sort by creation in a plain index range scan and never collide
// across workers. Zero storage, zero clock writes: the caller's Date.now
// (or an injected tick) feeds it, the tests pin the ordering.

/** The entropy bits of the tail (the per-ms collision room). */
const TAIL_BITS = 20n;
/** The lane bits above the tail (concurrent workers never share a field). */
const LANE_BITS = 2n;
/** The tail mask over the packed bigint. */
const TAIL_MASK = (1n << TAIL_BITS) - 1n;

/** The lane entropy: the strong platform randomness (crypto.getRandomValues
 * rides node and the browser alike), seeded once per process — the lane
 * rides ABOVE the tail, the fields never overlap. */
const LANEBYTES = new Uint8Array(1);
globalThis.crypto.getRandomValues(LANEBYTES);
const LANE = BigInt(LANEBYTES[0] & 0x03) << TAIL_BITS;

/** One strong random integer in [0, top) — the tail entropy source. */
function strongrandom(top: number): number {
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);
  const word = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | ((bytes[3] & 0x7f) << 24);
  return word % top;
}

let lastTick = 0n;
let tail = 0n;

/**
 * Mints one time-ordered 64-bit id. Within one millisecond the tail
 * increments, across milliseconds the clock orders; the lane entropy keeps
 * concurrent workers apart. Returns the decimal string form (the form the
 * db columns and the api carry — js numbers cannot hold 64 bits).
 *
 * @param tick the epoch milliseconds (defaults to Date.now; the tests
 * inject a fixed tick).
 * @returns the id as a decimal string, strictly ascending per tick.
 */
export function mintid(tick: number = Date.now()): string {
  const now = BigInt(tick);
  if (now === lastTick) {
    tail = (tail + 1n) & TAIL_MASK;
  } else {
    lastTick = now;
    tail = BigInt(Math.floor(Math.random() * 1024)) & TAIL_MASK;
  }
  const packed = (now << (TAIL_BITS + LANE_BITS)) | LANE | tail;
  return packed.toString(10);
}

/**
 * Reads the epoch milliseconds an id was minted at (the pointer is
 * self-describing — the audit trails the house law demands).
 *
 * @param id the decimal string id.
 * @returns the epoch milliseconds of the mint.
 */
export function idtick(id: string): number {
  return Number((BigInt(id) >> (TAIL_BITS + LANE_BITS)) & ((1n << 43n) - 1n));
}
