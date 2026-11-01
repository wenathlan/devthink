import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      /** the modality registry bridge of the ownership law, mirrored from
       * vite.config.ts: the sandbox lane tests read the ninety-modality
       * catalog through the published library specifier
       * ("@wenathlan/saddle/modalityregistry"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the vendored modalities.ts mirror retires with the lane import, so
       * the node-side tests answer the same module the dev server serves
       * and the catalog keeps one owner. */
      "@wenathlan/saddle/modalityregistry": path.resolve(import.meta.dirname, "../saddle/modalityregistry.ts"),
      /** the label store bridge of the ownership law: the app's copy
       * mechanism rides the vault factory through the published library
       * specifier ("@wenathlan/vault/labelstore"), and this bridge resolves
       * the specifier to the monorepo source the sibling engine carries —
       * the mechanism is never duplicated inside devthink. the entry retires
       * when the published envelope carries the built label store. */
      "@wenathlan/vault/labelstore": path.resolve(import.meta.dirname, "../vault/labelstore.ts"),

      /** the workload law bridge of the family: the app battery pins the
       * lane mirror against the engine catalog through the published
       * library specifier ("@wenathlan/saddle/workloadlaw"), and this
       * bridge resolves the specifier to the monorepo source the sibling
       * engine carries — the catalog is never duplicated inside devthink.
       * the entry retires when the published envelope carries the built
       * workload law. */
      "@wenathlan/saddle/workloadlaw": path.resolve(import.meta.dirname, "../saddle/workloadlaw.ts"),
      /** the exact-subpath bridge mirrored from vite.config.ts: the saddle
       * engine specifier resolves to the monorepo source (the installed
       * 2.1.6 envelope lacks the ./sandbox export surface), so any node-side
       * test that pulls the engine through the library specifier answers the
       * same module the dev server serves. retires when saddle 2.1.7
       * publishes the export entry. */
      "@wenathlan/saddle/sandbox": path.resolve(import.meta.dirname, "../saddle/sandbox.ts"),
      /** the getry engine bridge of the ownership law (pr16): the os imports
       * the 7-level reasoning ladder through the published library specifier
       * ("@wenathlan/getry/thinking"), and the bridge resolves the specifier
       * to the monorepo source the sibling app carries — the ladder is never
       * duplicated inside devthink, the engine answers from its one owner. */
      "@wenathlan/getry/thinking": path.resolve(import.meta.dirname, "../getry/thinking.ts"),
    },
  },
  test: {
    include: ["tests/*.test.ts"],
    environment: "node",
    /* the timeout floor stays thirty seconds on every native runner and scales through the env the emulated arm64 container leg sets (the 2.0.9 multi platform build proved a qemu-interpreted second answers the same green suite three to ten times slower), so an emulated runner never fails a test a native runner passed — the five second floor the house carried answered the cold-runner lottery: every lane that spawns subprocesses (the deno esm load, the matrix cell walk, the library modes) rides past it on a cold cache and the same test passes green on the retry, so the floor moves to the budget a subprocess walk actually needs while every fast test keeps answering in milliseconds */
    testTimeout: Number(process.env.DEVTHINK_TEST_TIMEOUT_MS ?? 30000),
    hookTimeout: Number(process.env.DEVTHINK_TEST_TIMEOUT_MS ?? 30000),
    coverage: { enabled: false },
  },
});
