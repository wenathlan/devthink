/**
 * Declaration seam for the compiled dist bundles the gate scripts load at
 * runtime. The dist tree ships plain JavaScript without declarations and it
 * exists only after tests/build.ts runs, so the dist import specifiers the
 * gates declare cannot resolve while the type checker walks the sources. This
 * wildcard answers exactly those unresolved .js specifiers: modules that carry
 * real sources behind a .js specifier (the .ts files of the repo) keep winning
 * resolution, so the seam only types the built bundles the checker never sees
 * and every gate keeps importing the compiled modules exactly as written.
 */
declare module "*.js";
