/** One deno script that imports the library through npm specifiers: the deno adapter reads its configuration and the same consent gates hold. */
import { bundlestamp, platformtargets } from "@wenathlan/extension";

const stamp = bundlestamp();
console.log(`devthink ${stamp.version} in ${stamp.mode} mode under deno ${Deno.version.deno}`);
console.log(`the platform matrix covers ${platformtargets().length} runtime targets`);
