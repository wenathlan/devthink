/** codefixtures.ts — The typescript example fixture set as one dense typescript module: the three runnable example scripts the 2.0.0 example gallery ships through dist/fixtures — the mcp client, the bun shell and the deno shell — each export holding the exact original file text of the former devthink/tests/code corpus. The flat typed folder law dissolved the tests/code directory, so the example texts answer from this module the same way every json, csv and html fixture answers from its family module; the build stamps them into dist/fixtures beside the recipe plans and the gallery pages. */

/** The mcp client example — one minimal script that lists the devthink tools over stdio: run \`node dist/fixtures/mcp.client.ts\` with the serve command of the extension cli in your path. Exactly the text of the former tests/code/mcp.client.ts. */
export const mcpclientexample = `/** One minimal mcp client script that lists the devthink tools over stdio: run \`node dist/fixtures/mcp.client.ts\` with the serve command of the extension cli in your path. */
import { spawn } from "node:child_process";

const child = spawn("node", ["dist/cli.js", "serve", "--stdio"], { stdio: ["pipe", "pipe", "inherit"] });
const send = (id, method, params) => child.stdin.write(\`\${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\\n\`);
child.stdout.on("data", chunk => {
  for (const line of String(chunk).trim().split("\\n")) {
    if (line === "") continue;
    const frame = JSON.parse(line);
    if (frame.id === 1) { console.log(\`server: \${frame.result.serverInfo.name} \${frame.result.serverInfo.version}\`); send(2, "tools/list", {}); }
    if (frame.id === 2) { console.log(\`\${frame.result.tools.length} tools:\`); for (const tool of frame.result.tools) console.log(\`  \${tool.name} (\${tool.metadata?.riskclass ?? "read"})\`); child.kill(); }
  }
});
send(1, "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "example client", version: "1" } });
`;

/** The bun shell example — one bun script that imports the library through the bun runtime: the same consent-first library loads with the node default adapters. Exactly the text of the former tests/code/bun.ts. */
export const bunshellexample = `/** One bun script that imports the library through the bun runtime: the same consent-first library loads with the node default adapters. */
import { bundlestamp, parseproposal } from "@wenathlan/extension";

const stamp = bundlestamp();
console.log(\`devthink \${stamp.version} in \${stamp.mode} mode under bun \${Bun.version}\`);
const proposal = parseproposal(JSON.stringify({ version: stamp.version, plan: { id: "plan1", state: "awaitingapproval", objective: "Read the release notes", steps: [{ id: "s1", kind: "observe", summary: "Observe the page." }] } }), "https://example.org");
console.log(\`the plan parses with \${proposal.plan.steps.length} step\${proposal.plan.steps.length === 1 ? "" : "s"} under the same review the extension runs\`);
`;

/** The deno shell example — one deno script that imports the library through npm specifiers: the deno adapter reads its configuration and the same consent gates hold. Exactly the text of the former tests/code/deno.ts. */
export const denoshellexample = `/** One deno script that imports the library through npm specifiers: the deno adapter reads its configuration and the same consent gates hold. */
import { bundlestamp, platformtargets } from "@wenathlan/extension";

const stamp = bundlestamp();
console.log(\`devthink \${stamp.version} in \${stamp.mode} mode under deno \${Deno.version.deno}\`);
console.log(\`the platform matrix covers \${platformtargets().length} runtime targets\`);
`;
