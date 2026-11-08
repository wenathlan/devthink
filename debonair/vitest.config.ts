import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside debonair. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),
      /** the onboarding store bridge of the ownership law: the app's
       * seen-flags mechanism rides the vault factory through the published
       * library specifier ("@wenathlan/vault/onboardingstore"), and this
       * bridge resolves the specifier to the monorepo source the sibling
       * engine carries — the mechanism is never duplicated inside debonair.
       * the entry retires when the published envelope carries the built
       * onboarding store. */
      "@wenathlan/vault/onboardingstore": path.resolve(import.meta.dirname, "../vault/onboardingstore.ts"),

      /** the storage lane bridge of the ownership law: the app's sqlite
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/storage"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the bootstrap and the helpers are never duplicated inside debonair.
       * the entry retires when the published envelope carries the built
       * storage lane. */
      "@wenathlan/vault/storage": path.resolve(import.meta.dirname, "../vault/storage.ts"),

      /** the workload law bridge of the family: the app battery pins the
       * lane mirror against the engine catalog through the published
       * library specifier ("@wenathlan/saddle/workloadlaw"), and this
       * bridge resolves the specifier to the monorepo source the sibling
       * engine carries — the catalog is never duplicated inside debonair.
       * the entry retires when the published envelope carries the built
       * workload law. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),

      /** the cadria engine bridge of the ownership law: the cover palette
       * derivation rides the visual engine through the published library
       * specifier ("@wenathlan/cadria/synth"), and this bridge
       * resolves the specifier to the monorepo source the sibling engine
       * carries — the palette mapping is never duplicated inside debonair
       * (the audio descriptor is debonair's own contract, the palette law
       * is cadria's). the entry retires when the published envelope carries
       * the built palette engine. */
      "@wenathlan/cadria/synth": path.resolve(import.meta.dirname, "../cadria/synth.ts"),

      /** the audio family self bridges the consolidation rides: the library
       * face walk pins every audio specifier of the published surface
       * ("@wenathlan/debonair/audio", the legacy "audioengine",
       * "audioattributes", "audiodecode", "audiofeatures" and
       * "audiopipeline" keys the embedders already ride) against the one
       * keyword file the leaf retirement seated — every audio specifier
       * resolves to the consolidated audio.ts, the same target the exports
       * map promises (the installed envelope does not carry the
       * consolidated file yet — the bridges are the resolution until the
       * published one lands). the transitive specifier the cadria palette
       * engine rides ("@wenathlan/debonair/audiofeatures" carries the dim
       * order the palette folds) answers the same file. each entry retires
       * when the published envelope carries the consolidated module. */
      "@wenathlan/debonair/audio": path.resolve(import.meta.dirname, "audio.ts"),
      "@wenathlan/debonair/audioattributes": path.resolve(import.meta.dirname, "audio.ts"),
      "@wenathlan/debonair/audiodecode": path.resolve(import.meta.dirname, "audio.ts"),
      "@wenathlan/debonair/audiofeatures": path.resolve(import.meta.dirname, "audio.ts"),
      "@wenathlan/debonair/audiopipeline": path.resolve(import.meta.dirname, "audio.ts"),
      "@wenathlan/debonair/audioengine": path.resolve(import.meta.dirname, "audio.ts"),

      /** the route table self bridge the wave 2d carve out rides: the
       * library face walk pins the leaf through the published library
       * specifier ("@wenathlan/debonair/routetable" — the nineteen-row
       * catalog the gateway and the sibling lanes ride), so the app
       * resolves its own published surface to its own source (the
       * installed envelope does not carry the leaf yet — the bridge is the
       * resolution until the published one lands). the entry retires when
       * the published envelope carries the built route table. */
      "@wenathlan/debonair/routetable": path.resolve(import.meta.dirname, "routetable.ts"),
    },
  },
  test: {
    include: ["test/*.test.ts"],
    environment: "node",
    /* the serial suite seat (the runner's memory law the remote forensics
     * walked): the battery died three runs straight at the runner's own
     * shutdown — every completed file green in every log, the deaths always
     * mid-suite, never a failed assertion — because the suite's file
     * parallelism answered the audio dsp with overlapping worker peaks and
     * the hosted runner's memory ceiling killed the runner service
     * mid-suite. the file lane rides single-file through the config the
     * runner reads (fileParallelism: false), the same vitest runner the
     * family law names, the script keeps answering vitest run exactly as
     * the vitest-only law pins, every test keeps its seat — the wall clock
     * pays what the memory saves. */
    fileParallelism: false,
    /* the timeout stays five seconds on every native runner and scales through the env the emulated arm64 container leg sets (a qemu-interpreted second answers the same green suite many times slower), so an emulated runner never fails a test a native runner passed */
    testTimeout: Number(process.env.DEBONAIR_TEST_TIMEOUT_MS ?? 5000),
    hookTimeout: Number(process.env.DEBONAIR_TEST_TIMEOUT_MS ?? 10000),
    coverage: { enabled: false },
  },
});
