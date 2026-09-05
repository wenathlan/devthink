/** The node builtin stub of the grand merge: the devthink workbench sections (config, session, storage, ids, models, constants, fingerprint, core) folded into the shared core graph carry real node builtin imports, while the platform-portable targets (the neutral and browser esm bundles, the per module entries and the umd mode) keep the reviewed contract that a browser loadable bundle never references a node module. The stub resolves every node and bun builtin import those sections make to one inline module whose functions throw a clear "use the node or bun entry" error when called, so the export surface stays complete and the bundles stay loadable in a browser while the node, cjs and bun targets keep the real builtins external. */

const stubmessage = (name) => `The node builtin ${name} of the merged devthink core stays behind the platform seam: this platform-portable bundle stubs it, so import the node, bun or deno entry of the library when the workbench surface needs the real builtin.`;

/** Every named builtin the merged core graph imports statically: the list is the union of the node:fs, node:os, node:path, node:crypto, node:url and node:fs/promises imports the devthink sections declare, so a stubbed bundle answers each import without a missing-export error. */
const stubexports = [
  "copyFileSync", "existsSync", "mkdirSync", "readFileSync", "renameSync", "writeFileSync", "readdirSync",
  "appendFileSync", "chmodSync", "statSync", "unlinkSync",
  "homedir", "platform", "arch", "hostname", "release",
  "join", "resolve", "basename", "dirname", "relative",
  "createHash", "randomInt", "randomBytes", "randomUUID", "timingSafeEqual",
  "fileURLToPath", "pathToFileURL",
  "access", "chmod", "mkdir", "readFile", "readdir", "rename", "unlink", "writeFile", "stat",
];

const stubcontents = (name) => `const stubreason = ${JSON.stringify(stubmessage(name))};
${stubexports.map((exportname) => `export function ${exportname}() { throw new Error(stubreason); }`).join("\n")}
export default { ${stubexports.map((exportname) => `${exportname}`).join(", ")} };
`;

/** The esbuild plugin that swaps every node and bun builtin for the throwing stub inside the platform-portable builds; the browser, neutral and umd targets pass it while the node, cjs and bun targets keep the real builtins. */
export const nodestubplugin = {
  name: "devthinknodebuiltin",
  setup(build) {
    build.onResolve({ filter: /^node:/ }, (args) => ({ path: args.path, namespace: "devthinknodebuiltin" }));
    build.onResolve({ filter: /^bun:/ }, (args) => ({ path: args.path, namespace: "devthinknodebuiltin" }));
    build.onLoad({ filter: /.*/, namespace: "devthinknodebuiltin" }, (args) => ({ contents: stubcontents(args.path), loader: "js" }));
  },
};
