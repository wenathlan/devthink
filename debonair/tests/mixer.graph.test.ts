// # mixer.graph.test — honest unit tests for the mixing graph model, runnable
// with the node built-in runner (no dependencies, no install):
//   node --test tests/mixer.graph.test.ts
// The desk fixtures reuse the real mixer strips the site seed serves.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertAcyclic,
  assertGraph,
  dbToLinear,
  effectiveGainDb,
  effectiveGains,
  graphFromStrips,
  linearToDb,
  MixerGraphError,
  patchChannel,
  resolvePaths,
  type MixerChannel,
} from "../mixer.graph.ts";
import { seedMixerStrips } from "../seed.ts";

describe("mixer graph construction", () => {
  it("builds the desk from the real seed strips, master included", () => {
    const graph = graphFromStrips(seedMixerStrips);
    assert.equal(graph.channels.length, seedMixerStrips.length);
    assert.equal(graph.masterid, "Master");
    assert.equal(graph.channels.find((channel) => channel.id === "Drums")?.gaindb, -4);
  });

  it("refuses a desk without a master row", () => {
    const orphans = seedMixerStrips.map((strip) => ({ ...strip, master: false }));
    assert.throws(() => graphFromStrips(orphans), (error: unknown) => {
      assert.ok(error instanceof MixerGraphError);
      assert.equal(error.code, "missing-master");
      return true;
    });
    assert.throws(() => graphFromStrips([]), MixerGraphError);
  });

  it("validates duplicate ids, unknown sends and non finite gains", () => {
    const graph = graphFromStrips(seedMixerStrips);
    const duplicated: MixerChannel = { id: "Drums", name: "Drums", gaindb: 0, mute: false, solo: false, sends: [] };
    assert.throws(() => assertGraph({ ...graph, channels: [...graph.channels, duplicated] }), (error: unknown) => {
      assert.ok(error instanceof MixerGraphError);
      assert.equal(error.code, "duplicate-channel");
      return true;
    });
    const withbadsend = patchChannel(graph, "Drums", { sends: [{ targetid: "ghost", gaindb: -3 }] });
    assert.throws(() => assertGraph(withbadsend), (error: unknown) => {
      assert.ok(error instanceof MixerGraphError);
      assert.equal(error.code, "unknown-send");
      return true;
    });
    const withnangain = patchChannel(graph, "Drums", { gaindb: Number.NaN });
    assert.throws(() => assertGraph(withnangain), (error: unknown) => {
      assert.ok(error instanceof MixerGraphError);
      assert.equal(error.code, "bad-gain");
      return true;
    });
  });
});

describe("mixer graph cycles", () => {
  const graph = graphFromStrips(seedMixerStrips);

  it("rejects a send loop between two strips", () => {
    const looped = patchChannel(
      patchChannel(graph, "Drums", { sends: [{ targetid: "Bass", gaindb: -3 }] }),
      "Bass",
      { sends: [{ targetid: "Drums", gaindb: -3 }] },
    );
    assert.throws(() => assertAcyclic(looped), (error: unknown) => {
      assert.ok(error instanceof MixerGraphError);
      assert.equal(error.code, "cycle");
      assert.equal(error.channelid, "Drums");
      return true;
    });
  });

  it("rejects a strip that sends to itself", () => {
    const selfsend = patchChannel(graph, "Bass", { sends: [{ targetid: "Bass", gaindb: 0 }] });
    assert.throws(() => assertAcyclic(selfsend), MixerGraphError);
  });

  it("accepts every strip sending straight to the master", () => {
    const fanned = patchChannel(graph, "Drums", { sends: [{ targetid: "Master", gaindb: -6 }] });
    assert.doesNotThrow(() => assertAcyclic(fanned));
  });
});

describe("mixer graph gains", () => {
  it("converts dB to linear and back", () => {
    assert.equal(dbToLinear(0), 1);
    assert.ok(Math.abs(dbToLinear(-6) - 0.501) < 0.001);
    assert.equal(dbToLinear(Number.NEGATIVE_INFINITY), 0);
    assert.equal(linearToDb(1), 0);
    assert.ok(Math.abs(linearToDb(dbToLinear(-6)) - -6) < 1e-9, `expected the -6 dB roundtrip to hold, got ${linearToDb(dbToLinear(-6))}`);
    assert.equal(linearToDb(0), Number.NEGATIVE_INFINITY);
  });

  it("chains the fader and the master additively in dB", () => {
    const graph = graphFromStrips(seedMixerStrips);
    // Drums -4 dB fader over the -2 dB master bus
    assert.ok(Math.abs(effectiveGainDb(graph, "Drums") - -6) < 1e-9);
    assert.equal(effectiveGainDb(graph, "Master"), -2);
  });

  it("mutes a strip to negative infinity and never mutates the input graph", () => {
    const graph = graphFromStrips(seedMixerStrips);
    const muted = patchChannel(graph, "Drums", { mute: true });
    assert.equal(effectiveGainDb(muted, "Drums"), Number.NEGATIVE_INFINITY);
    assert.equal(effectiveGainDb(graph, "Drums"), -6);
  });

  it("lets solo win: a soloed strip stays audible even muted, the rest falls silent", () => {
    const graph = patchChannel(graphFromStrips(seedMixerStrips), "Bass", { solo: true, mute: true });
    // solo wins over its own mute
    assert.equal(effectiveGainDb(graph, "Bass"), -8);
    // every unsoloed strip is silenced while a solo runs
    assert.equal(effectiveGainDb(graph, "Drums"), Number.NEGATIVE_INFINITY);
    assert.equal(effectiveGains(graph).Keys, Number.NEGATIVE_INFINITY);
  });

  it("answers the whole desk in one pass", () => {
    const gains = effectiveGains(graphFromStrips(seedMixerStrips));
    assert.equal(Object.keys(gains).length, seedMixerStrips.length);
    assert.equal(gains.Master, -2);
  });
});

describe("mixer graph routing paths", () => {
  it("resolves the direct desk path when a strip sends nowhere", () => {
    const graph = graphFromStrips(seedMixerStrips);
    const paths = resolvePaths(graph, "Drums");
    assert.equal(paths.length, 1);
    assert.deepEqual(paths[0].hops, ["Drums", "Master"]);
    assert.ok(Math.abs(paths[0].gaindb - -6) < 1e-9);
    assert.ok(Math.abs(paths[0].linear - dbToLinear(-6)) < 1e-9);
  });

  it("resolves the send path with the send and master gains chained", () => {
    const graph = patchChannel(graphFromStrips(seedMixerStrips), "Drums", { sends: [{ targetid: "Master", gaindb: -6 }] });
    const paths = resolvePaths(graph, "Drums");
    assert.equal(paths.length, 2);
    assert.ok(Math.abs(paths[0].gaindb - -6) < 1e-9); // direct: -4 + -2
    assert.ok(Math.abs(paths[1].gaindb - -12) < 1e-9); // send: -4 + -6 + -2
  });

  it("answers the master itself as a single hop", () => {
    const graph = graphFromStrips(seedMixerStrips);
    const paths = resolvePaths(graph, "Master");
    assert.equal(paths.length, 1);
    assert.deepEqual(paths[0].hops, ["Master"]);
    assert.equal(paths[0].gaindb, -2);
  });

  it("refuses an unknown channel", () => {
    const graph = graphFromStrips(seedMixerStrips);
    assert.throws(() => resolvePaths(graph, "ghost"), (error: unknown) => {
      assert.ok(error instanceof MixerGraphError);
      assert.equal(error.code, "unknown-channel");
      return true;
    });
  });
});
